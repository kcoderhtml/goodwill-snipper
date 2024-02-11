import { getFavoriteItems } from "./utils/api";
import { monitorAuction } from "./utils/utilities";
import {
  intro,
  outro,
  select,
  spinner,
  text,
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

try {
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
} catch (error) {
  console.error(error);
}
