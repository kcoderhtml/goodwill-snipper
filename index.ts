import { defaultUI, listUI, autoUI } from "./utils/ui";
import { parse } from "ts-command-line-args";

interface CommandLineArgs {
  auto?: boolean;
  list?: boolean;
  help?: boolean;
}

export const args = parse<CommandLineArgs>(
  {
    auto: {
      type: Boolean,
      optional: true,
      alias: "a",
      description:
        "Use default settings as configured by .env and start snipping.",
    },
    list: {
      type: Boolean,
      optional: true,
      alias: "l",
      description: "List favorite items.",
    },
    help: {
      type: Boolean,
      optional: true,
      alias: "h",
      description: "Prints this usage guide",
    },
  },
  {
    helpArg: "help",
    headerContentSections: [
      {
        header: "Goodwill Snipper",
        content: "Thanks for using Goodwill Snipper!",
      },
    ],
  },
);

try {
  if (args.auto) {
    await autoUI();
  } else if (args.list) {
    await listUI();
  } else {
    await defaultUI();
  }
} catch (error) {
  console.error(error);
}
