import {
    ActionPostResponse,
    createActionHeaders,
    createPostResponse,
    ActionGetResponse,
    ActionPostRequest,
    ACTIONS_CORS_HEADERS,
    MEMO_PROGRAM_ID
} from "@solana/actions";
import {
    clusterApiUrl,
    ComputeBudgetProgram,
    Connection,
    PublicKey,
    Transaction,
    TransactionInstruction,
} from "@solana/web3.js";

const headers = createActionHeaders({
    chainId: "devnet",
    actionVersion: "2.2.1",
    headers: ACTIONS_CORS_HEADERS,
});

// Example Get for donation
export const GET = async (req: Request) => {
    const payload: ActionGetResponse = {
        title: 'Donate to Alice',
        icon: '<image-url>',
        label: 'Donate SOL',
        description: 'Cybersecurity Enthusiast | Support my research with a donation.',
        "links": {
            "actions": [
                {
                    "label": "1 SOL",
                    "href": "/api/donate?amount=10"
                },
                {
                    "label": "5 SOL",
                    "href": "/api/donate?amount=100"
                },
                {
                    "label": "10 SOL",
                    "href": "/api/donate?amount=1000"
                },
                {
                    "label": "Donate",
                    "href": "/api/donate?amount={amount}",
                    "parameters": [
                        {
                            "name": "amount",
                            "label": "Enter a custom SOL amount"
                        }
                    ]
                }
            ]
        }
    };

    return Response.json(payload, {
        headers,
    });
}

export const OPTIONS = GET;


// Example Post for Memo
export const POST = async (req: Request) => {
    try {
        const body: ActionPostRequest = await req.json();
        console.log(body);

        let account: PublicKey;

        try {
            account = new PublicKey(body.account);
        } catch (err) {
            throw 'Invalid "account" provided';
        }

        const connection = new Connection(
            clusterApiUrl("devnet"),
        );

        const transaction = new Transaction();
        
        let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
        console.log("Blockhash",blockhash);
        transaction.recentBlockhash = blockhash;
        
        transaction.feePayer = account;
        
        console.log("Transaction",transaction);
        transaction.add(
            ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: 1000,
            }),
            new TransactionInstruction({
                programId: new PublicKey(MEMO_PROGRAM_ID),
                data: Buffer.from("this is simple memo message", 'utf-8'),
                keys: []
            })
        )
        const payload: ActionPostResponse = await createPostResponse({
            fields: {
                transaction,
            },
        });

        console.log(transaction);
        return Response.json(payload, {
            headers,
        });

    } catch (err) {
        console.log(err);
        return Response.json("An unknown error occurred", { status: 400 });
    }
};
