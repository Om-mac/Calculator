#ifndef CALCULATOR_H
#define CALCULATOR_H

#include <string>
#include <stdexcept>

class Calculator {
public:
    Calculator();
    ~Calculator();
    
    double add(double a, double b);
    double subtract(double a, double b);
    double multiply(double a, double b);
    double divide(double a, double b);
    double modulo(double a, double b);
    double power(double base, double exponent);
    
    double evaluate(const std::string& expression);

private:
    double parseExpression(const std::string& expr);
    double parseNumber(const std::string& str, size_t& pos);
    double parseTerm(const std::string& expr, size_t& pos);
    double parseExpression(const std::string& expr, size_t& pos);
    bool isOperator(char c);
};

#endif // CALCULATOR_H

