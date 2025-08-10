import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/register");
  };

  return (
    <section className="home">
      <div className="hero">
        <h1>Welcome to Landlord-Tenant App</h1>
        <p>Bridging the gap between landlords and tenants. One solution at a time.</p>
        <button onClick={handleGetStarted}>Get Started</button>
      </div>
    </section>
  );
};

export default Home;
