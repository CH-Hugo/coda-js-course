import { playerX, playerY, step, walkFrame, setPlayerPos, setWalkFrame, setCanInteract } from './state';

const player = document.getElementById('player') as HTMLElement;
const pikaSound = new Audio('/src/assets/pika.mp3');

export function updatePlayerPosition() {
    if (player) {
        player.style.left = `${playerX}px`;
        player.style.top = `${playerY}px`;
    }
}

export function movePlayer(key: string) {
    if (!player) return;
    const bubble = document.getElementById('player-bubble');
    if (bubble) bubble.style.display = 'none';

    let nextX = playerX;
    let nextY = playerY;

    const frame = (walkFrame + 1) % 4;
    setWalkFrame(frame);
    const posX = -(frame * 48);

    if (key === 'ArrowUp') {
        nextY -= step;
        player.style.backgroundPosition = `${posX}px -192px`;
    } else if (key === 'ArrowDown') {
        nextY += step;
        player.style.backgroundPosition = `${posX}px 0px`;
    } else if (key === 'ArrowLeft') {
        nextX -= step;
        player.style.backgroundPosition = `${posX}px -64px`;
    } else if (key === 'ArrowRight') {
        nextX += step;
        player.style.backgroundPosition = `${posX}px -128px`;
    }

    if (canMoveTo(nextX, nextY)) {
        setPlayerPos(nextX, nextY);
        updatePlayerPosition();
        checkCollision();
    }
}

function canMoveTo(x: number, y: number): boolean {
    if (x < 0 || x > 350 || y < 40 || y > 270) return false;
    if (x > 260 && y > 170) return false;
    if (y < 115 && x > 70) return false;
    if (x < 45 && y > 190) return false;
    return true;
}

export function checkCollision() {
    const pcRect = { x: 15, y: 90, width: 40, height: 40 };
    const pikaRect = { x: 220, y: 80, width: 35, height: 55 };
    const planteRect = { x:10, y: 250, width: 40, height: 63};
    const litRect = { x: 280, y: 210, width: 90, height: 80 };
    const bulleElement = document.getElementById('ma-bulle-dialogue'); 

    const isTouching = (r: any) => (
        playerX < r.x + r.width && playerX + 32 > r.x &&
        playerY < r.y + r.height && playerY + 32 > r.y
    );

    if (isTouching(pcRect)) {
        if (bulleElement) {
            bulleElement.innerHTML = "Veux-tu ouvrir le Pokédex ? <br> (Appuie sur ENTRÉE)";
            bulleElement.classList.remove('hidden');
        }
        setCanInteract(true);
    } else if (isTouching(pikaRect)) {
        if (bulleElement) {
            bulleElement.innerHTML = "Pika.. (traduction : mettez nous une bonne note)";
            bulleElement.classList.remove('hidden');
            pikaSound.play().catch(() => {});
        }
        setCanInteract(false);
    } else if (isTouching(planteRect)) {
        if (bulleElement) {
            bulleElement.innerHTML = "Quelle jolie plante.. (professeur Maxime s'en occupe bien)";
            bulleElement.classList.remove('hidden');
        }
        setCanInteract(false);
    } else if (isTouching(litRect)) {
        if (bulleElement) {
            bulleElement.innerHTML = "On dirait que professeur David se repose... <br> Laissons le dormir !";
            bulleElement.classList.remove('hidden');
        }
        setCanInteract(false);
    } else {
        bulleElement?.classList.add('hidden');
        setCanInteract(false);
    }
}