function RegisterPage() {
  return (
    <div>
      <h1>Cadastre-se</h1>
      <form action="">
        <input type="text" placeholder="Digite seu nome de usuário" />
        <input type="email" placeholder="Digite seu email" />
        <input type="password" placeholder="Digite sua senha" />
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}

export default RegisterPage;
