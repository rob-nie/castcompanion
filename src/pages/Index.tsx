import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col font-inter bg-background">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center text-center px-6 md:px-12 lg:px-24 py-16">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-primary">
          Synchronisiere deine<br />Interviews!
        </h1>
        <h2 className="text-base md:text-xl font-normal max-w-2xl">
          Effizientes Interview-Management mit Echtzeit-Notizen,<br className="hidden sm:block" />
          Timer und Messaging in einer zentralen Plattform.
        </h2>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
