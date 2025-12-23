import React from 'react';

const ResponsiveTest = () => {
  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Responsive Test</h1>
      
      {/* Breakpoint indicators */}
      <div className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Current Breakpoint:</h2>
        <div className="space-y-2">
          <div className="block sm:hidden bg-red-500 text-white p-2 rounded">Mobile (xs)</div>
          <div className="hidden sm:block md:hidden bg-orange-500 text-white p-2 rounded">Small (sm)</div>
          <div className="hidden md:block lg:hidden bg-yellow-500 text-white p-2 rounded">Medium (md)</div>
          <div className="hidden lg:block xl:hidden bg-green-500 text-white p-2 rounded">Large (lg)</div>
          <div className="hidden xl:block 2xl:hidden bg-blue-500 text-white p-2 rounded">Extra Large (xl)</div>
          <div className="hidden 2xl:block bg-purple-500 text-white p-2 rounded">2X Large (2xl)</div>
        </div>
      </div>

      {/* Grid test */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Grid Test:</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="bg-blue-500 text-white p-4 rounded text-center">
              Item {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Flex test */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Flex Test:</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 bg-green-500 text-white p-4 rounded">Flex Item 1</div>
          <div className="flex-1 bg-green-500 text-white p-4 rounded">Flex Item 2</div>
          <div className="flex-1 bg-green-500 text-white p-4 rounded">Flex Item 3</div>
        </div>
      </div>

      {/* Text size test */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Text Size Test:</h2>
        <div className="space-y-2">
          <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">Responsive text size</p>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl">Larger responsive text</p>
        </div>
      </div>

      {/* Spacing test */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Spacing Test:</h2>
        <div className="p-2 sm:p-4 md:p-6 lg:p-8 bg-yellow-200 rounded">
          <p>This box has responsive padding</p>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveTest;



