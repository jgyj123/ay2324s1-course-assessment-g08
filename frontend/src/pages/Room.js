import React, { useState, useEffect, useRef } from "react";
import ACTIONS from "../api/actions";
import Client from "../components/Client";
import Editor from "../components/Editor";
import { createSocketConnection } from "../sockets/collaborationServiceSocket";
import {
    useNavigate,
    useParams,
} from "react-router-dom";
import styles from "../styles/pages/Room.module.css";

const Room = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);

    useEffect(() => {
        const init = async () => {
            const token = JSON.parse(localStorage.getItem('credentials')).sessionToken;

            socketRef.current = createSocketConnection(token);
            socketRef.current.on("connect_error", (err) => handleErrors(err));
            socketRef.current.on("connect_failed", (err) => handleErrors(err));

            function handleErrors(e) {
                console.log("socket error", e);
                reactNavigator("/");
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId
            });

            socketRef.current.on(
                ACTIONS.JOIN_FAILED,
                () => console.log("Full capacity reached") // need to maybe add a modal here
            );

            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => {
                    console.log(`${username} joined the room.`);

                    setClients(clients);
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketId,
                    });
                }
            );

            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    console.log(`${username} left the room.`);
                    setClients((prevClients) =>
                        prevClients.filter(
                            (client) => client.socketId !== socketId
                        )
                    );
                }
            );

            socketRef.current.on('disconnect', () => {
                console.log('Collaboration WebSocket disconnected');
                socketRef.current.close();
            });
        };

        if (socketRef.current === null) {
            init();
        }
    }, []);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            console.log("Room ID copied to clipboard!");
        } catch (error) {
            console.log("Failed to copy room ID to clipboard!");
            console.log(error);
        }
    }

    function leaveRoom() {
        reactNavigator("/");
        socketRef.current.disconnect();
    }

    return (
        <div className={styles["mainWrap"]}>
            <div className={styles["aside"]}>
                <div className={styles["asideInner"]}>
                    <h3>Connected</h3>
                    <div className={styles["clientsList"]}>
                        {clients.map((client) => (
                            <Client
                                key={client.socketId}
                                username={client.username}
                            />
                        ))}
                    </div>
                </div>
                <button
                    className={`${styles["btn"]} ${styles["copyBtn"]}`}
                    onClick={copyRoomId}
                >
                    Copy Room ID
                </button>
                <button
                    className={`${styles["btn"]} ${styles["leaveBtn"]}`}
                    onClick={leaveRoom}
                >
                    Leave Room
                </button>
            </div>
            <div>
                <Editor
                    socketRef={socketRef}
                    roomId={roomId}
                    onCodeChange={(code) => {
                        codeRef.current = code;
                    }}
                />
            </div>
        </div>
    );
};

export default Room;
