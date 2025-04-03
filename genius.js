"use client"

import { useState } from "react"
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity, Alert, Dimensions } from "react-native"

// Obtém a largura da tela para cálculos responsivos
const { width } = Dimensions.get("window")
const GRID_SIZE = 3
const SQUARE_SIZE = width * 0.25
const SQUARE_MARGIN = 10

// Configurações para cada nível de dificuldade
const DIFFICULTY_SETTINGS = {
  easy: { initialLength: 2, flashDuration: 800, pauseDuration: 300, name: "Fácil" },
  medium: { initialLength: 3, flashDuration: 600, pauseDuration: 250, name: "Médio" },
  hard: { initialLength: 4, flashDuration: 400, pauseDuration: 200, name: "Difícil" },
}

// Cores para os quadrados
const COLORS = ["#FF5252", "#4CAF50", "#2196F3", "#FFEB3B", "#9C27B0", "#FF9800", "#00BCD4", "#795548", "#607D8B"]

export default function App() {
  // Estados do jogo
  const [difficulty, setDifficulty] = useState("easy")
  const [gameStarted, setGameStarted] = useState(false)
  const [sequence, setSequence] = useState([])
  const [playerSequence, setPlayerSequence] = useState([])
  const [activeSquare, setActiveSquare] = useState(null)
  const [isShowingSequence, setIsShowingSequence] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  // Função para iniciar um novo jogo
  const startGame = () => {
    const settings = DIFFICULTY_SETTINGS[difficulty]
    // Gera a sequência inicial
    const newSequence = Array(settings.initialLength)
      .fill()
      .map(() => Math.floor(Math.random() * 9))

    setSequence(newSequence)
    setPlayerSequence([])
    setScore(0)
    setGameStarted(true)

    // Mostra a sequência após um breve delay
    setTimeout(() => showSequence(newSequence), 1000)
  }

  // Função para mostrar a sequência ao jogador
  const showSequence = (sequenceToShow) => {
    setIsShowingSequence(true)
    const settings = DIFFICULTY_SETTINGS[difficulty]
    let currentIndex = 0

    // Usamos um intervalo para mostrar cada quadrado na sequência
    const interval = setInterval(() => {
      if (currentIndex < sequenceToShow.length) {
        // Ativa o quadrado atual
        setActiveSquare(sequenceToShow[currentIndex])

        // Desativa o quadrado após a duração do flash
        setTimeout(() => setActiveSquare(null), settings.flashDuration)
        currentIndex++
      } else {
        // Terminou de mostrar a sequência
        clearInterval(interval)
        setTimeout(() => setIsShowingSequence(false), settings.pauseDuration)
      }
    }, settings.flashDuration + settings.pauseDuration)
  }

  // Função para lidar com o toque do jogador em um quadrado
  const handleSquarePress = (index) => {
    // Ignora toques durante a exibição da sequência ou se o jogo não começou
    if (isShowingSequence || !gameStarted) return

    // Ativa o quadrado
    setActiveSquare(index)

    // Adiciona à sequência do jogador
    const newPlayerSequence = [...playerSequence, index]
    setPlayerSequence(newPlayerSequence)

    // Verifica se o jogador acertou o quadrado atual
    const currentStep = playerSequence.length

    // Desativa o quadrado após um curto período
    setTimeout(() => {
      setActiveSquare(null)

      if (index !== sequence[currentStep]) {
        // Jogador errou
        Alert.alert("Ops!", `Você errou a sequência! Sua pontuação foi: ${score}`, [
          { text: "Tentar Novamente", onPress: startGame },
        ])
        return
      }

      // Verifica se o jogador completou a sequência atual
      if (newPlayerSequence.length === sequence.length) {
        const newScore = score + 1
        setScore(newScore)

        // Atualiza o recorde se necessário
        if (newScore > highScore) setHighScore(newScore)

        // Adiciona um novo passo à sequência
        const newSequence = [...sequence, Math.floor(Math.random() * 9)]
        setSequence(newSequence)
        setPlayerSequence([])

        // Mostra a nova sequência após uma pausa
        setTimeout(() => showSequence(newSequence), 1000)
      }
    }, 300)
  }

  // Renderiza a grade de quadrados
  const renderGrid = () => {
    const grid = []
    for (let row = 0; row < GRID_SIZE; row++) {
      const rowSquares = []
      for (let col = 0; col < GRID_SIZE; col++) {
        const index = row * GRID_SIZE + col
        rowSquares.push(
          <TouchableOpacity
            key={index}
            style={[styles.square, { backgroundColor: COLORS[index] }, activeSquare === index && styles.activeSquare]}
            onPress={() => handleSquarePress(index)}
            disabled={isShowingSequence}
            activeOpacity={0.8}
          />,
        )
      }
      grid.push(
        <View key={row} style={styles.row}>
          {rowSquares}
        </View>,
      )
    }
    return grid
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Jogo Gênios</Text>

      {/* Botões de dificuldade */}
      <View style={styles.difficultyContainer}>
        <Text style={styles.difficultyTitle}>Dificuldade:</Text>
        <View style={styles.buttonRow}>
          {Object.keys(DIFFICULTY_SETTINGS).map((level) => (
            <TouchableOpacity
              key={level}
              style={[styles.difficultyButton, difficulty === level && styles.selectedDifficulty]}
              onPress={() => setDifficulty(level)}
              disabled={gameStarted}
            >
              <Text style={styles.difficultyText}>{DIFFICULTY_SETTINGS[level].name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Pontuação */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Pontuação: {score}</Text>
        <Text style={styles.scoreText}>Recorde: {highScore}</Text>
      </View>

      {/* Grade de jogo */}
      <View style={styles.gridContainer}>{renderGrid()}</View>

      {/* Botão de iniciar/reiniciar */}
      <TouchableOpacity
        style={[styles.startButton, gameStarted && styles.resetButton]}
        onPress={gameStarted ? () => setGameStarted(false) : startGame}
      >
        <Text style={styles.startButtonText}>{gameStarted ? "Reiniciar" : "Iniciar Jogo"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  gridContainer: {
    marginVertical: 20,
  },
  row: {
    flexDirection: "row",
  },
  square: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    margin: SQUARE_MARGIN,
    borderRadius: 8,
    opacity: 0.7,
  },
  activeSquare: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  difficultyContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  difficultyTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
  },
  difficultyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#333333",
    borderRadius: 20,
    marginHorizontal: 5,
  },
  selectedDifficulty: {
    backgroundColor: "#4CAF50",
  },
  difficultyText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  startButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 20,
  },
  resetButton: {
    backgroundColor: "#F44336",
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  scoreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  scoreText: {
    fontSize: 18,
    color: "#FFFFFF",
  },
})
