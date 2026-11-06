from flask import Blueprint

from data import mock_data
from services.response import data_response

overview_bp = Blueprint("overview", __name__)


@overview_bp.route("/api/overview")
def overview():
    return data_response(mock_data.OVERVIEW_KPIS, "mock")
