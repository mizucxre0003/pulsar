import asyncio
import logging
import os
import httpx
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo, ChatMemberUpdated
from aiohttp import web
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN", "YOUR_BOT_TOKEN_HERE")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://your-tma-url.com")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")  # service_role key for backend writes
PORT = int(os.environ.get("PORT", 8000))

logging.basicConfig(level=logging.INFO)
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


async def upsert_group(chat_id: int, title: str, username: str = None):
    """Save or update group in Supabase bot_groups table."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    payload = {"chat_id": chat_id, "title": title, "username": username}
    async with httpx.AsyncClient() as client:
        await client.post(f"{SUPABASE_URL}/rest/v1/bot_groups", json=payload, headers=headers)


async def delete_group(chat_id: int):
    """Remove group from Supabase when bot is kicked."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }
    async with httpx.AsyncClient() as client:
        await client.delete(f"{SUPABASE_URL}/rest/v1/bot_groups?chat_id=eq.{chat_id}", headers=headers)


@dp.my_chat_member()
async def on_bot_status_changed(event: ChatMemberUpdated):
    """Handle bot being added or removed from groups."""
    new_status = event.new_chat_member.status
    chat = event.chat

    if chat.type not in ("group", "supergroup"):
        return

    if new_status in ("member", "administrator"):
        logging.info(f"Bot added to group: {chat.title} ({chat.id})")
        await upsert_group(chat.id, chat.title, chat.username)
    elif new_status in ("left", "kicked"):
        logging.info(f"Bot removed from group: {chat.title} ({chat.id})")
        await delete_group(chat.id)


@dp.message(Command("start"))
async def start_handler(message: types.Message):
    chat_type = message.chat.type
    start_param = message.text.split(maxsplit=1)[1] if len(message.text.split()) > 1 else ""

    # Upsert user profile to database so they can be found by username by friends
    if message.from_user and SUPABASE_URL and SUPABASE_KEY:
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
        }
        user_payload = {
            "telegram_id": message.from_user.id,
            "username": message.from_user.username or "",
            "first_name": message.from_user.first_name,
            "last_name": message.from_user.last_name or ""
        }
        async with httpx.AsyncClient() as client:
            await client.post(f"{SUPABASE_URL}/rest/v1/profiles", json=user_payload, headers=headers)

    url_with_context = f"{WEBAPP_URL}?start_param={start_param}"
    if chat_type in ["group", "supergroup"]:
        url_with_context = f"{WEBAPP_URL}?group_id={message.chat.id}"

    markup = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🚀 Открыть Social Hub", web_app=WebAppInfo(url=url_with_context))]
    ])

    if chat_type in ["group", "supergroup"]:
        await upsert_group(message.chat.id, message.chat.title, message.chat.username or "")
        await message.answer(f"🎨 Холст для *{message.chat.title}* готов!", reply_markup=markup, parse_mode="Markdown")
    else:
        text = (
            "👋 Привет! Добро пожаловать в **Social Hub** 🎉\n\n"
            "Здесь ты можешь искать друзей, делиться профилем и слушать музыку вместе!\n"
            "Нажми на кнопку ниже, чтобы открыть приложение 👇"
        )
        await message.answer(text, reply_markup=markup, parse_mode="Markdown")


# Endpoint for notifying users about new requests
async def notify_request_handler(request):
    try:
        data = await request.json()
        to_tg_id = data.get("to_tg_id")
        from_username = data.get("from_username")
        
        if to_tg_id and from_username:
            text = f"🔔 **Новая заявка!**\nПользователь @{from_username} хочет добавить вас в друзья! Зайдите в Social Hub, чтобы принять заявку. 🚀"
            await bot.send_message(chat_id=to_tg_id, text=text, parse_mode="Markdown")
        return web.Response(text="OK", headers={"Access-Control-Allow-Origin": "*"})
    except Exception as e:
        logging.error(f"Error notifying: {e}")
        return web.Response(status=500, text=str(e), headers={"Access-Control-Allow-Origin": "*"})

async def handle_options(request):
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }
    return web.Response(status=204, headers=headers)

# Dummy HTTP server for Render Free Tier
async def handle_ping(request):
    return web.Response(text="Bot is alive!")


async def main():
    app = web.Application()
    app.router.add_get('/', handle_ping)
    app.router.add_post('/api/notify_request', notify_request_handler)
    app.router.add_options('/api/notify_request', handle_options)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', PORT)
    await site.start()
    logging.info(f"Health check & API server started on port {PORT}")
    
    # Must specify allowed_updates to receive my_chat_member events
    await dp.start_polling(bot, allowed_updates=["message", "my_chat_member", "chat_member"])


if __name__ == "__main__":
    asyncio.run(main())
