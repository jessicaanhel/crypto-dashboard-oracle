from flask import Blueprint

from data import mock_data
from services.response import data_response

settings_bp = Blueprint("settings", __name__)


@settings_bp.route("/api/settings/connections")
def connections():
    return data_response(mock_data.SETTINGS_CONNECTIONS, "mock")
