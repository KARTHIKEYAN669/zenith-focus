from marshmallow import Schema, fields, validate, post_load

class UserRegistrationSchema(Schema):
    email = fields.Email(required=True, validate=validate.Length(max=120))
    password = fields.String(required=True, validate=validate.Length(min=6, max=50))

class UserLoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True)

class PredictSchema(Schema):
    sleep = fields.Float(required=True, validate=validate.Range(min=0, max=12))
    study = fields.Float(required=True, validate=validate.Range(min=0, max=16))
    screen_time = fields.Float(required=True, validate=validate.Range(min=0, max=16))
    breaks = fields.Integer(required=True, validate=validate.Range(min=0, max=10))
    mood = fields.String(required=True, validate=validate.OneOf(['happy', 'good', 'sad', 'stressed']))

class FeedbackSchema(Schema):
    category = fields.String(required=True, validate=validate.OneOf(['bug', 'feature', 'ui']))
    message = fields.String(required=True, validate=validate.Length(min=1, max=1000))
