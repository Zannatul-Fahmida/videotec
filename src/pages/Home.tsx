import Header from "../components/Header"

const Home = () => {
  return (
    <div className="min-h-screen bg-[#272B69] py-8 px-4">
      <Header />
    <div className="container mx-auto p-4 text-center text-white md:max-w-[375px]">
      <h1 className="text-3xl font-bold mb-4">Welcome to Videotec</h1>
      <p className="text-lg">Your ultimate video platform</p>
    </div>
    </div>
  )
}

export default Home