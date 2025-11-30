#include "calculator.h"
#include <cmath>
#include <sstream>
#include <cctype>
#include <stdexcept>

Calculator::Calculator() {}

Calculator::~Calculator() {}

double Calculator::add(double a, double b) {
    return a + b;
}

double Calculator::subtract(double a, double b) {
    return a - b;
}

double Calculator::multiply(double a, double b) {
    return a * b;
}

double Calculator::divide(double a, double b) {
    if (b == 0) {
        throw std::invalid_argument("Division by zero");
    }
    return a / b;
}

double Calculator::modulo(double a, double b) {
    if (b == 0) {
        throw std::invalid_argument("Modulo by zero");
    }
    return std::fmod(a, b);
}

double Calculator::power(double base, double exponent) {
    return std::pow(base, exponent);
}

double Calculator::evaluate(const std::string& expression) {
    size_t pos = 0;
    return parseExpression(expression, pos);
}

double Calculator::parseNumber(const std::string& str, size_t& pos) {
    while (pos < str.size() && std::isspace(str[pos])) {
        pos++;
    }
    
    size_t start = pos;
    if (pos < str.size() && (str[pos] == '-' || str[pos] == '+')) {
        pos++;
    }
    
    while (pos < str.size() && (std::isdigit(str[pos]) || str[pos] == '.')) {
        pos++;
    }
    
    if (start == pos) {
        throw std::invalid_argument("Expected number at position " + std::to_string(pos));
    }
    
    return std::stod(str.substr(start, pos - start));
}

double Calculator::parseTerm(const std::string& expr, size_t& pos) {
    double result = parseNumber(expr, pos);
    
    while (pos < expr.size()) {
        while (pos < expr.size() && std::isspace(expr[pos])) {
            pos++;
        }
        
        if (pos >= expr.size() || (expr[pos] != '*' && expr[pos] != '/' && expr[pos] != '%' && expr[pos] != '^')) {
            break;
        }
        
        char op = expr[pos];
        pos++;
        double right = parseNumber(expr, pos);
        
        if (op == '*') {
            result = multiply(result, right);
        } else if (op == '/') {
            result = divide(result, right);
        } else if (op == '%') {
            result = modulo(result, right);
        } else if (op == '^') {
            result = power(result, right);
        }
    }
    
    return result;
}

double Calculator::parseExpression(const std::string& expr, size_t& pos) {
    double result = parseTerm(expr, pos);
    
    while (pos < expr.size()) {
        while (pos < expr.size() && std::isspace(expr[pos])) {
            pos++;
        }
        
        if (pos >= expr.size() || (expr[pos] != '+' && expr[pos] != '-')) {
            break;
        }
        
        char op = expr[pos];
        pos++;
        double right = parseTerm(expr, pos);
        
        if (op == '+') {
            result = add(result, right);
        } else if (op == '-') {
            result = subtract(result, right);
        }
    }
    
    return result;
}
