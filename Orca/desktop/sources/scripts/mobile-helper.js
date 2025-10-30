'use strict'

/* Mobile Helper for Orca */

function MobileHelper() {
  this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  this.input = document.getElementById('mobile-input')
  this.keyboard = document.getElementById('mobile-keyboard')
  this.keyboardButtons = document.getElementById('mobile-keyboard-buttons')
  this.positionDisplay = document.getElementById('kb-position')
  this.isKeyboardVisible = false
  this.currentPos = { x: 0, y: 0 }

  // Orca operators and common characters
  this.keys = [
    // Operators (green)
    { char: 'A', type: 'operator', desc: 'Add' },
    { char: 'B', type: 'operator', desc: 'Bounce' },
    { char: 'C', type: 'operator', desc: 'Clock' },
    { char: 'D', type: 'operator', desc: 'Delay' },
    { char: 'E', type: 'operator', desc: 'East' },
    { char: 'F', type: 'operator', desc: 'If' },
    { char: 'G', type: 'operator', desc: 'Generator' },
    { char: 'H', type: 'operator', desc: 'Halt' },
    { char: 'I', type: 'operator', desc: 'Increment' },
    { char: 'J', type: 'operator', desc: 'Jumper' },
    { char: 'K', type: 'operator', desc: 'Konkat' },
    { char: 'L', type: 'operator', desc: 'Less' },
    { char: 'M', type: 'operator', desc: 'Multiply' },
    { char: 'N', type: 'operator', desc: 'North' },
    { char: 'O', type: 'operator', desc: 'Output' },
    { char: 'P', type: 'operator', desc: 'Push' },
    { char: 'Q', type: 'operator', desc: 'Query' },
    { char: 'R', type: 'operator', desc: 'Random' },
    { char: 'S', type: 'operator', desc: 'South' },
    { char: 'T', type: 'operator', desc: 'Track' },
    { char: 'U', type: 'operator', desc: 'Uclid' },
    { char: 'V', type: 'operator', desc: 'Variable' },
    { char: 'W', type: 'operator', desc: 'West' },
    { char: 'X', type: 'operator', desc: 'Write' },
    { char: 'Y', type: 'operator', desc: 'Yumper' },
    { char: 'Z', type: 'operator', desc: 'Lerp' },
    // Numbers
    { char: '0', type: 'number' },
    { char: '1', type: 'number' },
    { char: '2', type: 'number' },
    { char: '3', type: 'number' },
    { char: '4', type: 'number' },
    { char: '5', type: 'number' },
    { char: '6', type: 'number' },
    { char: '7', type: 'number' },
    { char: '8', type: 'number' },
    { char: '9', type: 'number' },
    // Special characters
    { char: '*', type: 'normal', desc: 'Bang' },
    { char: '#', type: 'normal', desc: 'Comment' },
    { char: ':', type: 'normal', desc: 'MIDI' },
    { char: ';', type: 'normal', desc: 'UDP' },
    { char: '=', type: 'normal', desc: 'OSC' },
    { char: '!', type: 'normal', desc: 'CC' },
    { char: '?', type: 'normal', desc: 'MIDI In' },
    { char: '%', type: 'normal', desc: 'Mono' },
    { char: '.', type: 'normal', desc: 'Empty' }
  ]

  this.install = function() {
    if (!this.isMobile) return

    console.log('Installing mobile helper...')

    // Create keyboard buttons
    this.createKeyboard()

    // Close button
    document.getElementById('kb-close').addEventListener('click', () => {
      this.hideKeyboard()
    })

    // Handle touch on canvas
    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false })
      canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false })
    }

    // Prevent default behaviors
    document.addEventListener('touchmove', (e) => {
      if (e.target === canvas) {
        e.preventDefault()
      }
    }, { passive: false })

    // Handle input from native keyboard (if opened)
    this.input.addEventListener('input', this.onInput.bind(this))
    this.input.addEventListener('keydown', this.onKeyDown.bind(this))
  }

  this.createKeyboard = function() {
    this.keys.forEach(key => {
      const btn = document.createElement('button')
      btn.className = `mobile-key ${key.type}`
      btn.textContent = key.char
      if (key.desc) {
        btn.title = key.desc
      }
      btn.dataset.char = key.char
      btn.addEventListener('click', () => {
        this.writeChar(key.char)
      })
      this.keyboardButtons.appendChild(btn)
    })

    // Special buttons
    const specialButtons = [
      { char: '⌫', action: 'backspace', label: 'Delete' },
      { char: '→', action: 'move-right', label: 'Move Right' },
      { char: '←', action: 'move-left', label: 'Move Left' },
      { char: '↑', action: 'move-up', label: 'Move Up' },
      { char: '↓', action: 'move-down', label: 'Move Down' }
    ]

    specialButtons.forEach(btn => {
      const button = document.createElement('button')
      button.className = 'mobile-key special'
      button.textContent = btn.char
      button.title = btn.label
      button.addEventListener('click', () => {
        this.handleSpecialAction(btn.action)
      })
      this.keyboardButtons.appendChild(button)
    })
  }

  this.onTouchStart = function(e) {
    e.preventDefault()
    const touch = e.touches[0]
    const pos = this.getTouchPosition(touch)
    
    this.currentPos = pos
    this.showKeyboard(pos)
    
    // Move cursor
    if (typeof client !== 'undefined' && client.cursor) {
      client.cursor.moveTo(pos.x, pos.y)
    }
  }

  this.onTouchMove = function(e) {
    e.preventDefault()
    const touch = e.touches[0]
    const pos = this.getTouchPosition(touch)
    
    this.currentPos = pos
    this.updatePosition(pos)
    
    // Move cursor
    if (typeof client !== 'undefined' && client.cursor) {
      client.cursor.moveTo(pos.x, pos.y)
    }
  }

    this.getTouchPosition = function(touch) {
    const canvas = document.querySelector('canvas')
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    
    // Get actual tile size from orca
    const tileW = (typeof client !== 'undefined' && client.orca && client.orca.tile) 
        ? client.orca.tile.w 
        : (window.innerWidth < 480 ? 6 : (window.innerWidth < 768 ? 7 : 10))
    
    const tileH = (typeof client !== 'undefined' && client.orca && client.orca.tile) 
        ? client.orca.tile.h 
        : (window.innerWidth < 480 ? 10 : (window.innerWidth < 768 ? 12 : 15))
    
    // محاسبه موقعیت با در نظر گرفتن transform scale
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = Math.floor(((touch.clientX - rect.left) * scaleX) / tileW)
    const y = Math.floor(((touch.clientY - rect.top) * scaleY) / tileH)
    
    console.log('Touch:', { x, y, tileW, tileH })
    
    return { x: Math.max(0, x), y: Math.max(0, y) }
    }

  this.showKeyboard = function(pos) {
    this.keyboard.classList.add('visible')
    this.isKeyboardVisible = true
    this.updatePosition(pos)
  }

  this.hideKeyboard = function() {
    this.keyboard.classList.remove('visible')
    this.isKeyboardVisible = false
  }

  this.updatePosition = function(pos) {
    if (this.positionDisplay) {
      this.positionDisplay.textContent = `Position: ${pos.x}, ${pos.y}`
    }
  }

  this.writeChar = function(char) {
    if (typeof client !== 'undefined' && client.orca && client.cursor) {
      const lowerChar = char.toLowerCase()
      client.orca.write(client.cursor.x, client.cursor.y, lowerChar)
      client.cursor.move(1, 0) // Move right after writing
      this.currentPos = { x: client.cursor.x, y: client.cursor.y }
      this.updatePosition(this.currentPos)
    }
  }

  this.handleSpecialAction = function(action) {
    if (typeof client === 'undefined' || !client.cursor) return

    switch (action) {
      case 'backspace':
        client.orca.write(client.cursor.x, client.cursor.y, '.')
        break
      case 'move-right':
        client.cursor.move(1, 0)
        break
      case 'move-left':
        client.cursor.move(-1, 0)
        break
      case 'move-up':
        client.cursor.move(0, -1)
        break
      case 'move-down':
        client.cursor.move(0, 1)
        break
    }

    this.currentPos = { x: client.cursor.x, y: client.cursor.y }
    this.updatePosition(this.currentPos)
  }

  this.onInput = function(e) {
    const char = e.data || this.input.value.slice(-1)
    if (char && char.length === 1) {
      this.writeChar(char)
      this.input.value = ''
    }
  }

  this.onKeyDown = function(e) {
    if (e.key === 'Enter') {
      this.input.blur()
      this.hideKeyboard()
    }
  }
}

// Auto-install when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const mobileHelper = new MobileHelper()
    mobileHelper.install()
  })
} else {
  const mobileHelper = new MobileHelper()
  mobileHelper.install()
}