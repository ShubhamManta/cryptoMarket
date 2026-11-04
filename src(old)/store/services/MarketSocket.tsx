import { useEffect } from "react";
import { useAppDispatch } from "../hooks/reduxHooks";
import { CryptoWebSocket } from "./cryptoWebSocket";

function MarketSocket() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const cryptoSocket = new CryptoWebSocket(dispatch);

        cryptoSocket.start();

        return () => {
            cryptoSocket.disconnect();
        };
    }, [dispatch]);

    return null;
}

export default MarketSocket;