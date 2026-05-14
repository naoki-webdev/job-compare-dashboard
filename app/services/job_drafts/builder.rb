module JobDrafts
  class Builder
    VALID_MODES = %w[rule ai].freeze
    WORK_STYLES = %w[full_remote hybrid onsite].freeze

    def initialize(user:, text:, url:, mode:)
      @user = user
      @text = text.to_s
      @url = url.to_s.strip
      @mode = VALID_MODES.include?(mode.to_s) ? mode.to_s : "rule"
    end

    def call
      raw, actual_mode = extract

      {
        mode: actual_mode,
        ai_available: AiExtractor.available?,
        draft: build_draft(raw),
        insights: build_insights(raw)
      }
    end

    private

    def extract
      if @mode == "ai" && AiExtractor.available?
        ai = AiExtractor.new(text: @text, url: @url, masters: masters).call
        return [ ai, "ai" ] if ai.is_a?(Hash)
      end

      [ RuleBasedParser.new(text: @text, url: @url, masters: masters).call, "rule" ]
    end

    def masters
      @masters ||= {
        tech_stacks: TechStack.ordered.to_a,
        locations: Location.ordered.to_a,
        positive_keywords: @user.positive_keywords.active.ordered.to_a,
        negative_keywords: @user.negative_keywords.active.ordered.to_a,
        interview_questions: @user.interview_questions.active.ordered.to_a
      }
    end

    def build_draft(raw)
      tech_records = matched_tech_stacks(raw["tech_stacks"])
      location_record = matched_location(raw["location"])

      {
        company_name: raw["company_name"],
        source_url: @url.presence,
        salary_min: raw["salary_min_jpy"],
        salary_max: raw["salary_max_jpy"],
        work_style: WORK_STYLES.include?(raw["work_style"]) ? raw["work_style"] : nil,
        tech_stack_ids: tech_records.map(&:id),
        tech_stack_names: tech_records.map(&:name),
        location_id: location_record&.id,
        location_name: location_record&.name
      }
    end

    def build_insights(raw)
      {
        score_estimate: integer_or_nil(raw["score_estimate"]),
        pros: Array(raw["pros"]).compact_blank,
        cons: Array(raw["cons"]).compact_blank,
        questions: Array(raw["questions"]).compact_blank
      }
    end

    def matched_tech_stacks(names)
      Array(names).flat_map do |name|
        next [] if name.blank?

        masters[:tech_stacks].select { |record| match?(record.name, name) }
      end.uniq
    end

    def matched_location(name)
      return nil if name.blank?

      masters[:locations].find { |record| match?(record.name, name) }
    end

    def match?(master_name, candidate)
      master = master_name.to_s.downcase
      target = candidate.to_s.downcase
      return false if master.empty? || target.empty?

      master == target || master.include?(target) || target.include?(master)
    end

    def integer_or_nil(value)
      Integer(value)
    rescue ArgumentError, TypeError
      nil
    end
  end
end
