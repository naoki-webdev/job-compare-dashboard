class ApplicationController < ActionController::API
  SAFE_REQUEST_METHODS = %w[GET HEAD OPTIONS].freeze
  BOOLEAN_TYPE = ActiveModel::Type::Boolean.new

  before_action :reject_write_request_in_read_only_mode

  private

  def reject_write_request_in_read_only_mode
    return unless read_only_mode?
    return if SAFE_REQUEST_METHODS.include?(request.request_method)

    render json: { errors: [ I18n.t("api.errors.read_only_mode", locale: :ja) ] }, status: :forbidden
  end

  def read_only_mode?
    default = Rails.env.production? ? "true" : "false"

    BOOLEAN_TYPE.cast(ENV.fetch("READ_ONLY_MODE", default))
  end
end
