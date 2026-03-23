import asyncio
import logging
import os
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN", "YOUR_BOT_TOKEN_HERE")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://your-tma-url.com")

logging.basicConfig(level=logging.INFO)

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def start_handler(message: types.Message):
    # Detect context based on chat type and start payload
    chat_type = message.chat.type
    start_param = message.text.split(maxsplit=1)[1] if len(message.text.split()) > 1 else ""
    
    # If the bot is added to a group, the chat_id will be the group's ID (which is < 0)
    # The TMA can also receive a custom start_param to denote group launch
    url_with_context = f"{WEBAPP_URL}?start_param={start_param}"
    if chat_type in ["group", "supergroup"]:
        # Launching from group
        url_with_context = f"{WEBAPP_URL}?group_id={message.chat.id}"
        pass

    markup = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="Open Group Social Hub", web_app=WebAppInfo(url=url_with_context))]
    ])

    if chat_type in ["group", "supergroup"]:
        await message.answer(f"🚀 Canvas for *{message.chat.title}* is ready!", reply_markup=markup, parse_mode="Markdown")
    else:
        await message.answer("Welcome to your Social Hub! Open the app to check your friends and recent activity.", reply_markup=markup)

async def main():
    print("Starting bot...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
