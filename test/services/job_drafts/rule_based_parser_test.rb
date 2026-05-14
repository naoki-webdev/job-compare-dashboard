require "test_helper"

module JobDrafts
  class RuleBasedParserTest < ActiveSupport::TestCase
    setup do
      JobTechStack.delete_all
      Job.delete_all
      Location.delete_all
      Position.delete_all
      TechStack.delete_all
      ScoringPreference.delete_all
      PositiveKeyword.delete_all
      NegativeKeyword.delete_all
      InterviewQuestion.delete_all
      ActivityLog.delete_all
      User.delete_all

      @user = create_user(email: "parser@example.com")
      @tokyo = Location.create!(name: "東京", score_weight: 6, active: true, display_order: 0)
      @remote_location = Location.create!(name: "リモート", score_weight: 12, active: true, display_order: 1)
      @react = TechStack.create!(name: "React", score_weight: 8, active: true, display_order: 0)
      @ts = TechStack.create!(name: "TypeScript", score_weight: 15, active: true, display_order: 1)
      @go = TechStack.create!(name: "Go", score_weight: 6, active: true, display_order: 2)

      @masters = masters_for(@user)
    end

    test "extracts company name, salary, tech stacks and user-owned insights" do
      @user.positive_keywords.create!(pattern: "React", label: "React を使う開発", active: true, display_order: 0)
      @user.negative_keywords.create!(pattern: "業務範囲", label: "業務範囲を確認", active: true, display_order: 0)
      @user.interview_questions.create!(body: "チーム体制と役割分担", active: true, display_order: 0)

      text = <<~TEXT
        株式会社サンプル
        職種: フロントエンドエンジニア
        年収: 700万〜900万
        勤務地: 東京（フルリモート可）
        必須スキル: React, TypeScript
        業務範囲の確認が必要です。
      TEXT

      result = JobDrafts::RuleBasedParser.new(text: text, url: "https://example.com/job/1", masters: masters_for(@user)).call

      assert_match(/サンプル/, result["company_name"])
      assert_equal 7_000_000, result["salary_min_jpy"]
      assert_equal 9_000_000, result["salary_max_jpy"]
      assert_nil result["work_style"]
      assert_includes result["tech_stacks"], "React"
      assert_includes result["tech_stacks"], "TypeScript"
      assert_equal "東京", result["location"]
      assert_includes result["pros"], "React を使う開発"
      assert_includes result["cons"], "業務範囲を確認"
      assert_equal [ "チーム体制と役割分担" ], result["questions"]
      assert_kind_of Integer, result["score_estimate"]
    end

    test "returns nil work_style when no keywords match" do
      result = JobDrafts::RuleBasedParser.new(text: "普通の求人です", url: "", masters: @masters).call

      assert_nil result["work_style"]
      assert_nil result["location"]
    end

    test "returns empty insights when the user has no evaluation masters" do
      result = JobDrafts::RuleBasedParser.new(text: "本文", url: "", masters: @masters).call

      assert_empty result["pros"]
      assert_empty result["cons"]
      assert_empty result["questions"]
      assert_nil result["score_estimate"]
    end

    test "does not use another user's evaluation masters" do
      other_user = create_user(email: "other-parser@example.com")
      other_user.positive_keywords.create!(pattern: "React", label: "別ユーザーのReact評価", active: true, display_order: 0)
      other_user.negative_keywords.create!(pattern: "業務範囲", label: "別ユーザーの業務範囲評価", active: true, display_order: 0)
      other_user.interview_questions.create!(body: "別ユーザーの質問", active: true, display_order: 0)

      result = JobDrafts::RuleBasedParser.new(text: "React 業務範囲", url: "", masters: masters_for(@user)).call

      assert_empty result["pros"]
      assert_empty result["cons"]
      assert_empty result["questions"]
    end

    private

    def masters_for(user)
      {
        tech_stacks: TechStack.ordered.to_a,
        locations: Location.ordered.to_a,
        positive_keywords: user.positive_keywords.active.ordered.to_a,
        negative_keywords: user.negative_keywords.active.ordered.to_a,
        interview_questions: user.interview_questions.active.ordered.to_a
      }
    end
  end
end
