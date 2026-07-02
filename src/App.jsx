import BuscadorUID from './components/BuscadorUID';

function App() {
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
      <BuscadorUID onConfirmar={(player) => console.log('Confirmado:', player)} />
    </div>
  );
}

export default App;


