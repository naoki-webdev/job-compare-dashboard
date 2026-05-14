ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "securerandom"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    def create_user(name: "テストユーザー", email: nil, password: "password")
      User.create!(
        name: name,
        email: email || "user-#{SecureRandom.hex(8)}@example.com",
        password: password,
        password_confirmation: password
      )
    end
  end
end

module ApiAuthHelper
  def auth_headers(user)
    { "Authorization" => "Bearer #{AuthToken.issue(user)}" }
  end
end

ActionDispatch::IntegrationTest.include ApiAuthHelper
