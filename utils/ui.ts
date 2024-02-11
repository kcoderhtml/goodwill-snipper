import { getFavoriteItems } from "./api";
import { monitorAuction } from "./utilities";
import {
  intro,
  outro,
  select,
  spinner,
  text,
  note,
  isCancel,
  cancel,
  confirm,
} from "@clack/prompts";

let bidSafety: boolean = JSON.parse(
  process.env.GOODWILL_SNIPPER_BID_SAFETY || "true",
);
let maxBid: number = +(process.env.GOODWILL_SNIPPER_MAX_BID || 0); // in dollars
let itemId: number = +(process.env.GOODWILL_SNIPPER_ITEM_ID || 0); // Item ID
let snipperLeadTime: number = +(process.env.GOODWILL_SNIPPER_LEAD_TIME || 0); // in seconds
const zipCode: string = process.env.GOODWILL_SNIPPER_ZIP_CODE || ""; // Zip Code
const bearerToken: string = process.env.GOODWILL_SNIPPER_BEARER_TOKEN || ""; // Bearer Token

export async function defaultUI() {
  intro(`Welcome to Goodwill Snipper!`);
  const wrapper = spinner();
  wrapper.start("Setting Environment Variables");

  const s = spinner();

  const favoriteItems = await getFavoriteItems(bearerToken);

  const auction = await select({
    message: "Pick an Item.",
    options: favoriteItems,
  });

  itemId = auction as number;

  const maxBidInput = await text({
    message: "Enter your max bid",
    initialValue: maxBid.toString(),
    validate(value) {
      if (value.length === 0) return `Value is required!`;
      if (isNaN(+value)) return `Value must be a number!`;
    },
  });

  maxBid = parseInt(maxBidInput.toString());

  const leadTimeInput = await text({
    message: "Enter your lead time",
    initialValue: snipperLeadTime.toString(),
    validate(value) {
      if (value.length === 0) return `Value is required!`;
      if (isNaN(+value)) return `Value must be a number!`;
    },
  });

  snipperLeadTime = parseInt(leadTimeInput.toString());

  const safetyInput = await confirm({
    message: "Do you want to enable bid safety?",
  });

  bidSafety = JSON.parse(safetyInput.toString());

  s.start(`Loading Values...`);
  await new Promise((resolve) => setTimeout(resolve, 100));
  s.stop(`Item ID: ${itemId}`);
  s.stop(`Max Bid: ${maxBid}`);
  s.stop(`Lead Time: ${snipperLeadTime}`);
  s.stop(`Bid Safety: ${bidSafety}`);

  wrapper.stop("Environment Variables Set!");

  if (isCancel(wrapper)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  await monitorAuction(
    itemId,
    zipCode,
    bearerToken,
    maxBid,
    snipperLeadTime,
    bidSafety,
  );

  outro(`Goodbye!`);
}

export async function listUI() {
  intro(`Welcome to Goodwill Snipper!`);
  const wrapper = spinner();
  wrapper.start("Getting Favorite Items...");
  const favoriteItems = await getFavoriteItems(bearerToken);
  wrapper.stop("Favorite Items Loaded!");

  // return a `` of the label field of each favorite item on new lines
  const formattedItems = favoriteItems
    .map((item: any) => item.label)
    .join("\n");
  note(formattedItems);

  outro(`Goodbye!`);
}

export async function autoUI() {
  intro(`Welcome to Goodwill Snipper!`);

  await monitorAuction(
    itemId,
    zipCode,
    bearerToken,
    maxBid,
    snipperLeadTime,
    bidSafety,
  );

  outro(`Goodbye!`);
}
