module Api
  class SessionsController < ApplicationController
    skip_before_action :authenticate_user!, only: :create
    skip_before_action :reject_write_request_for_read_only_user, only: [ :create, :destroy ]

    def show
      render json: session_payload(token: nil)
    end

    def create
      user = User.find_by(email: session_params[:email].to_s.strip.downcase)

      if user&.authenticate(session_params[:password])
        render json: session_payload(user: user, token: AuthToken.issue(user)), status: :created
      else
        render json: { errors: [ I18n.t("api.errors.invalid_login", locale: :ja) ] }, status: :unauthorized
      end
    end

    def destroy
      head :no_content
    end

    private

    def session_payload(user: current_user, token:)
      payload = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          read_only: user.read_only?,
          ai_enabled: user.ai_enabled?
        }
      }
      payload[:token] = token if token
      payload
    end

    def session_params
      params.require(:session).permit(:email, :password)
    end
  end
end
