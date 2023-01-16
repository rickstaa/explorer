import { getCacheControlHeader } from "@lib/api";
import { l1Provider } from "@lib/chains";
import { NextApiRequest, NextApiResponse } from "next";

import { parseArweaveTxId, parseCid } from "livepeer/utils";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ArrayBuffer | null>
) => {
  try {
    const method = req.method;

    if (method === "GET") {
      const { name } = req.query;

      res.setHeader("Cache-Control", getCacheControlHeader("day"));

      if (name && typeof name === "string" && name.length > 0) {
        const avatar = await l1Provider.getAvatar(name);

        const cid = parseCid(avatar);
        const arweaveId = parseArweaveTxId(avatar);

        const imageUrl = cid?.id
          ? `https://dweb.link/ipfs/${cid.id}`
          : arweaveId.id
          ? arweaveId.url
          : `https://metadata.ens.domains/mainnet/avatar/${name}`;

        const response = await fetch(imageUrl);

        const imageBlob = await response.blob();

        const buffer = await imageBlob.stream();

        return buffer.pipe(res);
      } else {
        return res.status(500).end("Invalid name");
      }
    }

    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (err) {
    console.error(err);
    return res.status(500).json(null);
  }
};

export default handler;
