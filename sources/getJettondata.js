import { Address, beginCell, internal, storeMessageRelaxed, toNano } from "@ton/core";

async function main() {
    const jettonWalletAddress = Address.parse("EQAhr_E1ZeivWb32S4IkAHqja7JEoyIZc7wt0TFEw0L2pu6M");
    const destinationAddress = Address.parse("EQC9reRXU-vXocy7RBiW6wYnRXNR6XkDROXGWXxo1ZwzMmQ_");

    const forwardPayload = beginCell()
        .storeUint(0, 32) // 0 opcode means we have a comment
        .storeStringTail("Hello, TON!")
        .endCell();

    const messageBody = beginCell()
        .storeUint(0x0f8a7ea5, 32) // opcode for jetton transfer
        .storeUint(0, 64) // query id
        .storeCoins(toNano(2)) // jetton amount, amount * 10^9
        .storeAddress(destinationAddress)
        .storeAddress(destinationAddress) // response destination
        .storeBit(0) // no custom payload
        .storeCoins(toNano("0.02")) // forward amount - if >0, will send notification message
        .storeBit(1) // we store forwardPayload as a reference
        .storeRef(forwardPayload)
        .endCell();

    const internalMessage = internal({
        to: jettonWalletAddress,
        value: toNano("0.1"),
        bounce: true,
        body: messageBody,
    });
    console.log("Internal message:", internalMessage.toString());
    const internalMessageCell = beginCell().store(storeMessageRelaxed(internalMessage)).endCell();

    console.log("Internal message cell:", internalMessageCell.toString());
}

main().finally(() => console.log("Exiting..."));
