import { log, spinner } from "@clack/prompts";
import { getShippingCost, getItemDetail, placeBid } from "./api";

export function convertTimeToSeconds(remainingTime: string): number {
  const timeRegex = /(?:(\d+)d)?\s*(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/;
  const match = remainingTime.match(timeRegex);

  if (!match) {
    console.error("Invalid time format");
    return 0;
  }

  const days = match[1] ? parseInt(match[1], 10) : 0;
  const hours = match[2] ? parseInt(match[2], 10) : 0;
  const minutes = match[3] ? parseInt(match[3], 10) : 0;
  const seconds = match[4] ? parseInt(match[4], 10) : 0;

  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

export async function monitorAuction(
  itemId: number,
  zipCode: string,
  bearerToken: string,
  maxBid: number,
  snipperLeadTime: number,
  bidSafety: boolean,
) {
  try {
    const itemDetail = await getItemDetail(itemId, bearerToken);
    log.info(
      `${bidSafety ? `Monitoring "${itemDetail.title}"` : `Snipping "${itemDetail.title}" up to a max bid of $${maxBid}, ${snipperLeadTime} seconds before auction ends.`}`,
    );
    const s = spinner();
    s.start(`Monitoring Auction...`);
    const shippingCost = await getShippingCost(itemId, zipCode, bearerToken);
    while (true) {
      const itemDetail = await getItemDetail(itemId, bearerToken);
      const timeLeft = convertTimeToSeconds(itemDetail.remainingTime);

      const display = `"${itemDetail.title}" - ${itemDetail.numberOfBids} bids - ${itemDetail.remainingTime}- ${itemDetail.bidHistory.isHighBidderLogIn ? `$${itemDetail.currentPrice} - ✅` : `$${itemDetail.minimumBid} - ❌`} - ${bidSafety ? `🔐` : `🔓`} - $${shippingCost} shipping cost`;
      s.message(display);

      if (itemDetail.bidHistory.auctionClosed) {
        console.log("Auction has ended");
        s.stop(`Auction has ended`);
        break;
      } else if (
        timeLeft < snipperLeadTime + 1 &&
        itemDetail.minimumBid < maxBid &&
        !bidSafety &&
        !itemDetail.bidHistory.isHighBidderLogIn
      ) {
        console.log("Bidding now");
        const bidAmount = itemDetail.minimumBid + itemDetail.bidIncrement;
        const response = await placeBid(
          itemDetail.itemId,
          itemDetail.sellerId,
          bidAmount,
          bearerToken,
        );
        log.warn(response);
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.error(error);
  }
}
