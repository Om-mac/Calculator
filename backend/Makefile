CXX = clang++
CXXFLAGS = -std=c++17 -Wall -Wextra
SRCDIR = src
INCDIR = include
BUILDDIR = build

SOURCES = $(SRCDIR)/main.cpp $(SRCDIR)/calculator.cpp
OBJECTS = $(BUILDDIR)/main.o $(BUILDDIR)/calculator.o
TARGET = $(BUILDDIR)/calculator

all: $(TARGET)

$(TARGET): $(OBJECTS)
	$(CXX) $(CXXFLAGS) -o $@ $^

$(BUILDDIR)/%.o: $(SRCDIR)/%.cpp
	@mkdir -p $(BUILDDIR)
	$(CXX) $(CXXFLAGS) -I$(INCDIR) -c $< -o $@

clean:
	rm -rf $(BUILDDIR)

run: $(TARGET)
	./$(TARGET)

.PHONY: all clean run
