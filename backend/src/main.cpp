#include <sstream>
#include <iostream>
#include <string>
#include <sstream>
#include "calculator.h"

int main() {
    Calculator calc;
    std::string input;
    
    std::cout << "=== Expression Calculator ===" << std::endl;
    std::cout << "Enter mathematical expressions:" << std::endl;
    std::cout << "Examples: 2+3, 5+6, 10*5-2, 100/4, 2^3, 10%3" << std::endl;
    std::cout << "Supports: + - * / % ^ (power)" << std::endl;
    std::cout << "Type 'exit' to quit\n" << std::endl;
    
    while (true) {
        std::cout << "> ";
        std::getline(std::cin, input);
        
        if (input == "exit" || input == "quit") {
            std::cout << "Goodbye!" << std::endl;
            break;
        }
        
        if (input.empty()) continue;
        
        try {
            double result = calc.evaluate(input);
            std::cout << "= " << result << std::endl;
        } catch (const std::exception& e) {
            std::cerr << "Error: " << e.what() << std::endl;
        }
    }
    
    return 0;
}
