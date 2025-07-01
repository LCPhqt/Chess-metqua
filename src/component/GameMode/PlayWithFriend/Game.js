import { Chess } from 'chess.js';
import { map } from 'rxjs/operators';
import { auth } from '../../../FireBase/config';
import { fromRef } from 'rxfire/firestore';
import { getDoc, updateDoc, setDoc } from 'firebase/firestore';

let gameRef;
let member;
const chess = new Chess();
export let gameSubject;

// Hàm tạo uid riêng cho mỗi trình duyệt nếu chưa đăng nhập
function getGuestUid() {
  let uid = localStorage.getItem('guest_uid');
  if (!uid) {
    uid = 'guest_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('guest_uid', uid);
  }
  return uid;
}

// Tự tạo phòng nếu chưa có
export async function initGame(gameRefFb) {
  const { currentUser } = auth;
  const uid = currentUser ? currentUser.uid : getGuestUid();

  if (gameRefFb) {
    gameRef = gameRefFb;

    let docSnap = await getDoc(gameRefFb);
    let initialGame = docSnap.data();

    // Nếu chưa có phòng, tự tạo phòng mới
    if (!initialGame) {
      const memberData = {
        uid,
        piece: 'w',
        name: 'Người Tạo Phòng',
        creator: true
      };
      const game = {
        status: 'waiting',
        members: [memberData],
        gameId: gameRefFb.id
      };
      await setDoc(gameRefFb, game);
      initialGame = game;
    }

    const creator = initialGame.members.find(m => m.creator === true);
    if (initialGame.status === 'waiting' && creator.uid !== uid) {
      const currUser = {
        uid,
        name: 'Người Mời Vào Phòng',
        piece: creator.piece === 'w' ? 'b' : 'w'
      };
      const updatedMembers = [...initialGame.members, currUser];

      await updateDoc(gameRefFb, {
        members: updatedMembers,
        status: 'ready'
      });
    } else if (!initialGame.members.map(m => m.uid).includes(uid)) {
      return 'intruder';
    }

    chess.reset();
    gameSubject = fromRef(gameRefFb).pipe(
      map(snapshot => {
        const game = snapshot.data();
        const { pendingPromotion, gameData, ...restOfGame } = game;

        member = game.members.find(m => m.uid === uid);
        const oponent = game.members.find(m => m.uid !== uid);

        if (gameData) {
          chess.load(gameData);
        }

        const isGameOver = chess.isGameOver();

        return {
          board: chess.board(),
          pendingPromotion,
          isGameOver,
          position: member.piece,
          member,
          oponent,
          result: isGameOver ? getGameResult() : null,
          ...restOfGame
        };
      })
    );
  }
}

// Export các hàm để các file khác import được
export async function   resetGame() {
  if (gameRef) {
    await updateGame(null, true);
    chess.reset();
  }
}

export function handleMove(from, to) {
  if (from === to) return;

  const promotions = chess.moves({ verbose: true }).filter(m => m.promotion);
  let pendingPromotion;
  if (promotions.some(p => `${p.from}:${p.to}` === `${from}:${to}`)) {
    pendingPromotion = { from, to, color: promotions[0].color };
    updateGame(pendingPromotion);
  }

  if (!pendingPromotion) {
    move(from, to);
  }
}

export function move(from, to, promotion) {
  if (from === to) return;

  let tempMove = { from, to };
  if (promotion) {
    tempMove.promotion = promotion;
  }

  try {
    if (gameRef) {
      if (member.piece === chess.turn()) {
        const legalMove = chess.move(tempMove);
        if (legalMove) {
          updateGame();
        } else {
          alert("Nước đi không hợp lệ!");
        }
      }
    }
  } catch (error) {
    console.error("Lỗi khi di chuyển:", error);
    alert("Lỗi nước đi: " + error.message);
  }
}

async function updateGame(pendingPromotion, reset) {
  const isGameOver = chess.isGameOver();

  if (gameRef) {
    const updatedData = {
      gameData: chess.fen(),
      pendingPromotion: pendingPromotion || null
    };

    if (reset) {
      updatedData.status = 'over';
    }

    await updateDoc(gameRef, updatedData);
  }
}

function getGameResult() {
  if (chess.isCheckmate()) {
    const winner = chess.turn() === 'w' ? 'BLACK' : 'WHITE';
    return `CHECKMATE - WINNER - ${winner}`;
  } else if (chess.isDraw()) {
    let reason = '50 - MOVES - RULE';
    if (chess.isStalemate()) {
      reason = 'STALEMATE';
    } else if (chess.isThreefoldRepetition()) {
      reason = 'REPETITION';
    } else if (chess.isInsufficientMaterial()) {
      reason = 'INSUFFICIENT MATERIAL';
    }
    return `DRAW - ${reason}`;
  } else {
    return 'UNKNOWN REASON';
  }
}