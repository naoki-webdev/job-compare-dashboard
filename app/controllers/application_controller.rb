class ApplicationController < ActionController::API
  SAFE_REQUEST_METHODS = %w[GET HEAD OPTIONS].freeze

  before_action :authenticate_user!
  before_action :reject_write_request_for_read_only_user

  private

  attr_reader :current_user

  def authenticate_user!
    user = user_from_bearer_token
    return @current_user = user if user

    render json: { errors: [ I18n.t("api.errors.unauthorized", locale: :ja) ] }, status: :unauthorized
  end

  def user_from_bearer_token
    token = bearer_token
    return if token.blank?

    user_id = AuthToken.user_id(token)
    User.find_by(id: user_id) if user_id
  end

  def bearer_token
    pattern = /^Bearer (?<token>.+)$/
    authorization = request.headers["Authorization"].to_s
    match = authorization.match(pattern)

    match[:token] if match
  end

  def record_activity!(action, record, metadata: {})
    current_user.activity_logs.create!(
      action: action,
      resource_type: record.class.name,
      resource_id: record.id,
      metadata: metadata
    )
  end

  def reject_write_request_for_read_only_user
    return if SAFE_REQUEST_METHODS.include?(request.request_method)
    return unless current_user
    return unless current_user.read_only? || protected_demo_email?

    render json: { errors: [ I18n.t("api.errors.read_only_demo", locale: :ja) ] }, status: :forbidden
  end

  def protected_demo_email?
    current_user.email == Rails.application.config.x.demo_account.email
  end
end
