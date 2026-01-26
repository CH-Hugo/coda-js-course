export function pokemonTransition(action: () => void) {
    const wiper = document.getElementById('screen-wiper');
    if (!wiper) return action();

    wiper.classList.add('clore');

    setTimeout(() => {
        action();
        setTimeout(() => {
            wiper.classList.remove('clore');
        }, 100);
    }, 700);
}