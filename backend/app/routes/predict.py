from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.predict_service import process_prediction
from app.schemas import PredictSchema
from marshmallow import ValidationError

bp = Blueprint('predict', __name__)

predict_schema = PredictSchema()

@bp.route('/', methods=['POST'])
@jwt_required()
def predict():
    """
    Calculate Focus & Burnout Scores
    ---
    tags:
      - Health Metrics
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          id: PredictInput
          required:
            - sleep
            - study
            - screen_time
            - breaks
            - mood
          properties:
            sleep:
              type: number
              example: 8.0
            study:
              type: number
              example: 4.5
            screen_time:
              type: number
              example: 3.0
            breaks:
              type: integer
              example: 5
            mood:
              type: string
              example: good
    responses:
      200:
        description: Prediction successful
      400:
        description: Validation failed or invalid values
      401:
        description: Unauthorized
    """
    user_id = get_jwt_identity()
    req_data = request.json
    
    if not req_data:
        return jsonify({
            "status": "error",
            "message": "No data provided",
            "data": None
        }), 400
        
    try:
        current_app.logger.info(f"Prediction requested by user: {user_id}")
        validated_data = predict_schema.load(req_data)
        result = process_prediction(user_id, validated_data)
        
        return jsonify({
            "status": "success",
            "message": "Prediction successful",
            "data": result
        }), 200
    except ValidationError as err:
        return jsonify({
            "status": "error",
            "message": "Validation failed",
            "data": err.messages
        }), 400
    except ValueError as e:
        current_app.logger.warning(f"Invalid input values for user {user_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Invalid input values",
            "data": str(e)
        }), 400
    except Exception as e:
        current_app.logger.error(f"Prediction error for user {user_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "An error occurred during prediction",
            "data": str(e)
        }), 500
