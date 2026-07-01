// Tool surface advertised to the model. The handlers are closure-bound to the
// resolved userId in ChatbotService, so the model never passes an id — there are
// no parameters to pass. This is what makes another user's data unreachable.
export type ToolName =
  | 'get_match_details'
  | 'get_upcoming_date'
  | 'get_app_help';

// Structurally compatible with LangChain's BindToolsInput (OpenAI tool format),
// kept local so this file doesn't depend on LangChain's internal type paths.
interface ChatToolDefinition {
  type: 'function';
  function: {
    name: ToolName;
    description: string;
    parameters: Record<string, unknown>;
  };
}

const NO_ARGS: Record<string, unknown> = {
  type: 'object',
  properties: {},
  additionalProperties: false,
};

export const TOOL_DEFINITIONS: ChatToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'get_match_details',
      description:
        "Get the current user's active weekly match: partner name, university, " +
        'major, short bio, and status. Call when the user asks about their match.',
      parameters: NO_ARGS,
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_upcoming_date',
      description:
        "Get the user's confirmed upcoming date: match name, place, address, date " +
        'and time. Call when the user asks about their date/plans.',
      parameters: NO_ARGS,
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_app_help',
      description:
        'Get help/FAQ about how TheConnection works. Call for app usage questions.',
      parameters: NO_ARGS,
    },
  },
];
