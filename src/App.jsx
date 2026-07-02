import { useState } from 'react';
import BuscadorUID from './components/BuscadorUID';
import GeneradorDiamantes from './components/GeneradorDiamantes';

function App() {
  const [confirmedPlayer, setConfirmedPlayer] = useState(null);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#060810',
      }}
    >
      {!confirmedPlayer ? (
        <BuscadorUID onConfirmar={(player) => setConfirmedPlayer(player)} />
      ) : (
        <GeneradorDiamantes
          player={confirmedPlayer}
          onNuevoJugador={() => setConfirmedPlayer(null)}
        />
      )}
    </div>
  );
}

export default App;





