class AuthToken
  EXPIRES_IN = 14.days

  class << self
    def issue(user)
      verifier.generate({ user_id: user.id }, expires_in: EXPIRES_IN)
    end

    def user_id(token)
      payload = verifier.verified(token)
      return unless payload.is_a?(Hash)

      payload["user_id"] || payload[:user_id]
    end

    private

    def verifier
      Rails.application.message_verifier(:api_auth_token)
    end
  end
end
