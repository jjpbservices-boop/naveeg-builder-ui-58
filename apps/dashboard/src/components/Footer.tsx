export function Footer() {
  return (
    <footer className="bg-[#0b0d10] text-white">
      <div className="container-max py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <span className="text-xl font-bold">Naveeg</span>
            <span className="text-gray-400">© 2025. All rights reserved.</span>
          </div>
          <div className="text-sm text-gray-400">
            Dashboard v1.0.0
          </div>
        </div>
      </div>
    </footer>
  )
}
