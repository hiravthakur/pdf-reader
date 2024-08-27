"use client";

import React, { useState, useRef } from 'react'
import { PdfLoader, PdfHighlighter, Highlight, Popup, AreaHighlight } from 'react-pdf-highlighter'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { StringToBoolean } from 'class-variance-authority/types';

// You'll need to replace this with the actual path to your PDF file
const PDF_URL = 'https://historyofeconomicthought.mcmaster.ca/hobbes/Leviathan.pdf'

type HighlightType = Highlight;


export default function Component() {
  const [searchQuery, setSearchQuery] = useState('')
  const [highlights, setHighlights] = useState<HighlightType[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const highlighterRef = useRef<any>(null)

  const searchPdf = () => {
    if (!highlighterRef.current) return

    const { viewer } = highlighterRef.current
    const pdfDocument = viewer.pdfDocument

    const searchResults: HighlightType[] = []

    const searchPages = async () => {
      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i)
        const textContent = await page.getTextContent()
        const text = textContent.items.map((item: any) => item.str).join(' ')

        let match
        const regex = new RegExp(searchQuery, 'gi')
        while ((match = regex.exec(text)) !== null) {
          const matchText = match[0]
          const matchIndex = match.index

          // This is a simplified way to get the position. In a real implementation,
          // you'd need to calculate the actual position based on the match index.
          searchResults.push({
            id: `${i}-${match.index}`,
            content: { text: matchText },
            position: {
              boundingRect: { x1: 0, y1: 0, x2: 100, y2: 20, pageNumber: i },
            },
          })
        }
      }

      setHighlights(searchResults)
    }

    searchPages()
  }

  const scrollToHighlight = (highlight: HighlightType) => {
    if (highlighterRef.current) {
      highlighterRef.current.scrollTo(highlight)
    }
  }

  const updateHighlight = (id: string, updateData: any) => {
    setHighlights((prevHighlights) =>
      prevHighlights.map((highlight) =>
        highlight.id === id
          ? {
              ...highlight,
              content: {
                ...highlight.content,
                ...updateData.content,
              },
              position: {
                ...highlight.position,
                ...updateData.position,
              },
            }
          : highlight
      )
    );
  };
  


  return (
    <div className="flex h-screen">
      <div className="w-1/4 p-4 border-r">
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search PDF..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-2"
          />
          <Button onClick={searchPdf} className="w-full">
            Search
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-120px)]">
          {highlights.map((highlight, index) => (
            <Card key={index} className="mb-2 cursor-pointer" onClick={() => scrollToHighlight(highlight)}>
              <CardContent className="p-2">
                <p className="text-sm truncate">{highlight.content.text}</p>
                <p className="text-xs text-muted-foreground">Page {highlight.position.boundingRect.pageNumber}</p>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      </div>
      <div className="flex-1">
        <PdfLoader url={PDF_URL} beforeLoad={<div>Loading PDF...</div>}>
          {(pdfDocument) => (
            <PdfHighlighter
              pdfDocument={pdfDocument}
              enableAreaSelection={(event) => event.altKey}
              ref={highlighterRef}
              highlightTransform={(highlight, index, setTip, hideTip, viewportToScaled, screenshot, isScrolledTo) => {
                const isTextHighlight = !Boolean(highlight.content && highlight.content.image)

                const component = isTextHighlight ? (
                  <Highlight
                    isScrolledTo={isScrolledTo}
                    position={highlight.position}
                    comment={highlight.comment}
                  />
                ) : (
                  <AreaHighlight
                    isScrolledTo={isScrolledTo}
                    highlight={highlight}
                    onChange={(boundingRect) => {
                      updateHighlight(highlight.id, boundingRect)
                    }}
                  />
                )

                return (
                  <Popup
                    popupContent={<div>{highlight.content.text}</div>}
                    onMouseOver={(popupContent) => setTip(highlight, (highlight) => popupContent)}
                    onMouseOut={hideTip}
                    key={index}
                  >
                    {component}
                  </Popup>
                )
              }}
              highlights={highlights}
            />
          )}
        </PdfLoader>
      </div>
    </div>
  )
}