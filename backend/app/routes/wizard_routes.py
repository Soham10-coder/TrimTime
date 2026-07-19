from flask import Blueprint
from app.controllers.wizard_controller import (
    get_wizard_progress, save_step_1, save_step_2, save_step_3, save_step_4,
    save_step_5, save_step_6, save_step_7, save_step_8
)
from app.middlewares.auth import auth_required

wizard_bp = Blueprint('wizard', __name__)

@wizard_bp.route('/progress', methods=['GET'])
@auth_required(roles=['barber'])
def progress():
    return get_wizard_progress()

@wizard_bp.route('/step-1', methods=['POST'])
@auth_required(roles=['barber'])
def step_1():
    return save_step_1()

@wizard_bp.route('/step-2', methods=['POST'])
@auth_required(roles=['barber'])
def step_2():
    return save_step_2()

@wizard_bp.route('/step-3', methods=['POST'])
@auth_required(roles=['barber'])
def step_3():
    return save_step_3()

@wizard_bp.route('/step-4', methods=['POST'])
@auth_required(roles=['barber'])
def step_4():
    return save_step_4()

@wizard_bp.route('/step-5', methods=['POST'])
@auth_required(roles=['barber'])
def step_5():
    return save_step_5()

@wizard_bp.route('/step-6', methods=['POST'])
@auth_required(roles=['barber'])
def step_6():
    return save_step_6()

@wizard_bp.route('/step-7', methods=['POST'])
@auth_required(roles=['barber'])
def step_7():
    return save_step_7()

@wizard_bp.route('/step-8', methods=['POST'])
@auth_required(roles=['barber'])
def step_8():
    return save_step_8()
