import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const PerfilPublico = () => {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/usuarios/${id}`).then(res => res.json()).then(setProfile);
    }
  }, [id]);

  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <h1>Perfil de {profile.nombre}</h1>
      <h2>Propuestas</h2>
      <ul>
        {profile.propuestas.map((p: any) => (
          <li key={p.id}>
            {p.titulo} - Votos: +{p.votosPositivos} -{p.votosNegativos}
          </li>
        ))}
      </ul>
      {profile.votos && (
        <div>
          <h2>Votos</h2>
          {/* List votes */}
        </div>
      )}
    </div>
  );
};

export default PerfilPublico;