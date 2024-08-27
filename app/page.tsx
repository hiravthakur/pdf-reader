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
          <Button className="w-full">
            Search
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-120px)]">
        </ScrollArea>
      </div>
      <div className="flex-1">
      <PdfLoader url={PDF_URL} beforeLoad={<div>temp</div>}>
            {(pdfDocument) => (
              <PdfHighlighter
                pdfDocument={pdfDocument}
                enableAreaSelection={(event) => event.altKey}
                onScrollChange={resetHash}
                // pdfScaleValue="page-width"
                scrollRef={(scrollTo) => {
                  this.scrollViewerTo = scrollTo;

                  this.scrollToHighlightFromHash();
                }}
                onSelectionFinished={(
                  position,
                  content,
                  hideTipAndSelection,
                  transformSelection,
                ) => (
                  <Tip
                    onOpen={transformSelection}
                    onConfirm={(comment) => {
                      this.addHighlight({ content, position, comment });

                      hideTipAndSelection();
                    }}
                  />
                )}
                highlightTransform={(
                  highlight,
                  index,
                  setTip,
                  hideTip,
                  viewportToScaled,
                  screenshot,
                  isScrolledTo,
                ) => {
                  const isTextHighlight = !highlight.content?.image;

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
                        this.updateHighlight(
                          highlight.id,
                          { boundingRect: viewportToScaled(boundingRect) },
                          { image: screenshot(boundingRect) },
                        );
                      }}
                    />
                  );

                  return (
                    <Popup
                      popupContent={<HighlightPopup {...highlight} />}
                      onMouseOver={(popupContent) =>
                        setTip(highlight, (highlight) => popupContent)
                      }
                      onMouseOut={hideTip}
                      key={index}
                    >
                      {component}
                    </Popup>
                  );
                }}
                highlights={highlights}
              />
            )}
          </PdfLoader>
      </div>
    </div>
  )
}