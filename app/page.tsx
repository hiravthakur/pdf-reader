"use client";

import React, { useState, useRef, useCallback } from 'react'
import { IHighlight, ScaledPosition, Position, LTWH, Content } from 'react-pdf-highlighter' 
import { PdfLoader, PdfHighlighter, Highlight, Popup, AreaHighlight, Tip, NewHighlight } from "react-pdf-highlighter";
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { StringToBoolean } from 'class-variance-authority/types';


const PDF_URL = 'test.pdf'

const promise = new Promise(() => {})  

interface HighlightPopupProps {
  content: string;
  comment: string;
}

const HighlightPopup: React.FC<HighlightPopupProps> = ({ content, comment }) => {
  return (
    <div>
      <p>{content}</p>
      <p>{comment}</p>
    </div>
  );
};

export default function Component() {
  const [searchQuery, setSearchQuery] = useState("");
  const [highlights, setHighlights] = useState<IHighlight[]>([]);
  const highlighterRef = useRef<any>(null); 

  const resetHash = () => {
    document.location.hash = "";
  };

  const scrollToHighlightFromHash = useCallback(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const highlight = highlights.find((highlight) => highlight.id === id);
      if (highlight && highlighterRef.current) {
        highlighterRef.current.scrollTo(highlight);
      }
    }
  }, [highlights]);

  const addHighlight = (highlight: NewHighlight) => {
    setHighlights((prevHighlights) => [
      ...prevHighlights,
      { ...highlight, id: String(Math.random()) }
    ]);
  };

  const updateHighlight = (id: string, position: ScaledPosition, content: Content) => {
    setHighlights((prevHighlights) =>
      prevHighlights.map((h) =>
        h.id === id
          ? { ...h, position: { ...position }, content }
          : h
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
          <Button className="w-full">Search</Button>
        </div>
        <ScrollArea className="h-[calc(100vh-120px)]"></ScrollArea>
      </div>
      <div className="flex-1">
        <PdfLoader
          url={PDF_URL}
          beforeLoad={<div>Loading PDF...</div>}
          errorMessage={<div>Error loading PDF. Please try again.</div>}
        >
          {(pdfDocument) => (
            <PdfHighlighter
              ref={highlighterRef}
              pdfDocument={pdfDocument}
              enableAreaSelection={(event) => event.altKey}
              onScrollChange={resetHash}
              scrollRef={(scrollTo) => {
                highlighterRef.current = { scrollTo };
                scrollToHighlightFromHash();
              }}
              onSelectionFinished={(
                position: ScaledPosition,
                content: Content,
                hideTipAndSelection: () => void,
                transformSelection: () => void
              ) => (
                <Tip
                  onOpen={transformSelection}
                  onConfirm={(comment) => {
                    addHighlight({ content, position, comment });
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
                isScrolledTo
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
                      updateHighlight(
                        highlight.id,
                        { boundingRect: viewportToScaled(boundingRect) } as ScaledPosition,
                        { image: screenshot(boundingRect) }
                      );
                    }}
                  />
                );
                return (
                  <Popup
                    popupContent={<HighlightPopup content={highlight.content.text || ""} comment={highlight.comment.text} />}
                    onMouseOver={(popupContent) => setTip(highlight, () => popupContent)}
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
  );
}