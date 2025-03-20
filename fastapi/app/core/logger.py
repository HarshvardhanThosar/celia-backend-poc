# app/core/logger.py

from colorlog import ColoredFormatter
import logging

# Define log format and colors
LOG_FORMAT = "%(log_color)s%(levelname)s:%(reset)8s %(message)s"

LOG_COLORS = {
    "DEBUG": "cyan",
    "INFO": "green",
    "WARNING": "yellow",
    "ERROR": "red",
    "CRITICAL": "bold_red",
}

# Set up the logger
formatter = ColoredFormatter(LOG_FORMAT, log_colors=LOG_COLORS)
handler = logging.StreamHandler()
handler.setFormatter(formatter)

logger = logging.getLogger("FastAPI-Logger")
logger.setLevel(logging.INFO)
logger.addHandler(handler)