import React, { useEffect, useState } from 'react';
import './App.css';
import { gameSubject, initGame, resetGame } from './Game';
import Board from './Board';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../../FireBase/config';
import { doc } from 'firebase/firestore';


function GameApp() {
  const [board, setBoard] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [result, setResult] = useState(null);
  const [position, setPosition] = useState();
  const [initResult, setInitResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [game, setGame] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();
  const shareableLink = window.location.href;

  useEffect(() => {
    let subscribe;

    const initialize = async () => {
    const gameRef = doc(db, 'games', id);;
      const res = await initGame(gameRef);
      setInitResult(res);
      setLoading(false);

      if (!res) {
        subscribe = gameSubject.subscribe((game) => {
           if (!game) return;
          setBoard(game.board);
          setIsGameOver(game.isGameOver);
          setResult(game.result);
          setPosition(game.position);
          setStatus(game.status);
          setGame(game);
        });
      }
    };

    initialize();

    return () => {
      if (subscribe) subscribe.unsubscribe();
    };
  }, [id]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      alert('Link Copy Thành Công!');
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleResetGame = async () => {
    await resetGame();
    navigate('/');
  };

 

  return (
    <div className="app-container">
      {isGameOver && (
        <h2 className="vertical-text">
          GAME OVER
          <button onClick={handleResetGame}>
            <span className="vertical-text">NEW GAME</span>
          </button>
        </h2>
      )}

      <div className="board-container">
        {game.oponent?.name && <span className="tag is-link">{game.oponent.name}</span>}
        <Board board={board} position={position} />
        {game.member?.name && <span className="tag is-link">{game.member.name}</span>}
      </div>

      {result && <p className="vertical-text">{result}</p>}

      {status === 'waiting' && (
        <div className="notification is-link share-game">
          <strong>Share this game to continue</strong>
          <br /><br />
          <div className="field has-addons">
            <div className="control is-expanded">
              <input type="text" className="input" readOnly value={shareableLink} />
            </div>
            <div className="control">
              <button className="button is-info" onClick={handleCopy}>Copy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameApp;
