/**
 * @enum
 * @description Names of known commands
 */
export enum HalloweenCommand {
  /**
   * Command for trick-or-treating.
   */
  Knock = "knock",
  /**
   * Command to get info on how to participate
   */
  Help = "help",
  /**
   * Command to get event information
   */
  Info = "info",
  /**
   * Compound command for prize management
   */
  Prize = "prize",
  /**
   * Compound command for managing event settings
   */
  Settings = "settings",
  /**
   * Command to get event credits
   */
  Credits = "credits",
  /**
   * Command for to be giving gifts yes
   */
  Gifty = "gifty",
}

export const commandStructure = {
  [HalloweenCommand.Prize]: {
    List: "list",
    Admin: {
      Add: "add",
      Edit: "edit",
    },
  },
  [HalloweenCommand.Settings]: {
    List: "list",
    Set: "set",
  },
} as const;
