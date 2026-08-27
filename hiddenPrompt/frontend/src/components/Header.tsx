const Header = () => {
  return (
    <div className="text-paper max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 py-4 sm:py-6 px-4 sm:px-6 border-b border-[#2a2825]">

      {/* Logo */}
      <div className="flex justify-center items-center gap-3 animate-bounce">
        <span className="h-2.5 w-2.5 bg-accent rounded-full inline-block animate-pulse"></span>

        <span className="font-display text-2xl sm:text-3xl">
          HIDDEN PROMPT
        </span>
      </div>

      {/* Case information */}
      <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-center">
        
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 bg-green-500 rounded-full inline-block animate-pulse"></span>

          <span className="text-yellowish font-body text-xs sm:text-sm">
            212 CASES OPEN
          </span>
        </div>

        <span className="hidden sm:inline text-yellowish">•</span>

        <span className="text-yellowish font-body text-xs sm:text-sm">
          FILE NO. 0417
        </span>

      </div>
    </div>
  );
};

export default Header;