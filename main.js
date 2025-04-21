// 슬라이더 제어
if (document.querySelector('.slider')) {
  const sliderContainer = document.querySelector('.slider')
  const slides = document.querySelectorAll('.slide')
  const prev = document.querySelector('.prev')
  const next = document.querySelector('.next')
  const dots = document.querySelectorAll('.dot')

  let index = 0
  let isMoving = false

  function updateSlider() {
    if (isMoving) return
    isMoving = true

    const slideWidth =
      window.innerWidth <= 768 ? window.innerWidth : sliderContainer.offsetWidth
    sliderContainer.style.transform = `translateX(-${index * slideWidth}px)`

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index)
    })

    setTimeout(() => {
      isMoving = false
    }, 500)
  }

  let resizeTimeout
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(updateSlider, 100)
  })

  prev.addEventListener('click', () => {
    if (!isMoving) {
      index = (index - 1 + slides.length) % slides.length
      updateSlider()
    }
  })

  next.addEventListener('click', () => {
    if (!isMoving) {
      index = (index + 1) % slides.length
      updateSlider()
    }
  })

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      if (!isMoving && index !== i) {
        index = i
        updateSlider()
      }
    })
  })

  updateSlider()
}

// 예시 코드 뷰어 제어
document.addEventListener('DOMContentLoaded', () => {
  const frameworkButtons = document.querySelectorAll(
    '.button-group .row button'
  )
  const modeButtons = document.querySelectorAll('.mode-buttons button')
  const codeBlocks = document.querySelectorAll('.code-box pre')

  let currentFramework = 'plain'
  let currentMode = 'html'

  codeBlocks.forEach((block) => {
    const codeElement = block.querySelector('code')
    if (codeElement.getAttribute('data-content') === currentMode) {
      block.style.display = 'block'
      hljs.highlightElement(codeElement)
    } else {
      block.style.display = 'none'
    }
  })

  frameworkButtons[0].classList.add('selected')

  frameworkButtons.forEach((button) => {
    button.addEventListener('click', () => {
      frameworkButtons.forEach((btn) => btn.classList.remove('selected'))
      button.classList.add('selected')

      currentFramework = button.getAttribute('data-framework')
      loadCodeExample(currentMode, currentFramework)
    })
  })

  modeButtons[0].classList.add('selected')

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.getAttribute('data-mode')

      modeButtons.forEach((btn) => btn.classList.remove('selected'))
      button.classList.add('selected')

      currentMode = mode
      loadCodeExample(mode, currentFramework)

      codeBlocks.forEach((block) => {
        const codeElement = block.querySelector('code')
        if (codeElement.getAttribute('data-content') === mode) {
          block.style.display = 'block'
          hljs.highlightElement(codeElement)
        } else {
          block.style.display = 'none'
        }
      })
    })
  })

  const codeElements = document.querySelectorAll(
    '.code-box code[contenteditable]'
  )

  codeElements.forEach((codeElement) => {
    hljs.highlightElement(codeElement)

    let timeout
    codeElement.addEventListener('input', () => {
      const selection = window.getSelection()
      const range = selection.getRangeAt(0)

      const preCaretRange = range.cloneRange()
      preCaretRange.selectNodeContents(codeElement)
      preCaretRange.setEnd(range.endContainer, range.endOffset)
      const caretOffset = preCaretRange.toString().length

      clearTimeout(timeout)
      timeout = setTimeout(() => {
        const originalHtml = codeElement.innerHTML
        const originalText = codeElement.textContent

        hljs.highlightElement(codeElement)

        const walker = document.createTreeWalker(
          codeElement,
          NodeFilter.SHOW_TEXT,
          null,
          false
        )

        let node
        let currentLength = 0

        while ((node = walker.nextNode())) {
          const nodeLength = node.textContent.length
          if (currentLength + nodeLength >= caretOffset) {
            const newRange = document.createRange()
            newRange.setStart(node, caretOffset - currentLength)
            newRange.setEnd(node, caretOffset - currentLength)

            selection.removeAllRanges()
            selection.addRange(newRange)
            break
          }
          currentLength += nodeLength
        }
      }, 150)
    })
  })

  loadCodeExample('html', 'plain')
})

async function loadCodeExample(mode, framework) {
  try {
    const basePath = window.location.origin
    const response = await fetch(
      `${basePath}/code-examples/${framework}-${mode}.txt`,
      {
        headers: {
          Accept: 'text/plain',
          'Content-Type': 'text/plain',
        },
      }
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const code = await response.text()

    const codeElement = document.querySelector(`code[data-content="${mode}"]`)
    if (codeElement) {
      codeElement.textContent = code
      hljs.highlightElement(codeElement)
    }
  } catch (error) {
    console.error(`Error loading ${mode} code for ${framework}:`, error)
    const codeElement = document.querySelector(`code[data-content="${mode}"]`)
    if (codeElement) {
      codeElement.textContent = `// ${framework} ${mode} example code not found`
      hljs.highlightElement(codeElement)
    }
  }
}
