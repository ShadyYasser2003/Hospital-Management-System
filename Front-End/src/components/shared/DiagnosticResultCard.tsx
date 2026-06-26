import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ImageOff, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import CriticalBadge from './CriticalBadge';

interface LabResultCardProps {
  result: string;
  referenceRange?: string | null;
  notes?: string | null;
  isCritical?: boolean | null;
}

export const LabResultCard: React.FC<LabResultCardProps> = ({
  result,
  referenceRange,
  notes,
  isCritical,
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        Result
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <p className="text-sm whitespace-pre-wrap">{result}</p>
      {referenceRange && (
        <p className="text-xs text-muted-foreground">Reference range: {referenceRange}</p>
      )}
      {notes && <p className="text-sm text-muted-foreground border-t pt-2">{notes}</p>}
      {isCritical && <CriticalBadge isCritical />}
    </CardContent>
  </Card>
);

interface RadiologyReportCardProps {
  reportFindings: string;
  impression?: string | null;
  imageUrl?: string | null;
  notes?: string | null;
  isCritical?: boolean | null;
}

/** Renders the actual image inline with a lightbox zoom option */
const ReportImage: React.FC<{ url: string }> = ({ url }) => {
  const [broken, setBroken]       = useState(false);
  const [lightbox, setLightbox]   = useState(false);

  if (broken) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-xs border rounded-lg p-3 bg-muted/30">
        <ImageOff className="h-4 w-4 shrink-0" />
        <span>Image could not be loaded</span>
        <a href={url} target="_blank" rel="noreferrer" className="ml-auto text-primary hover:underline text-xs">
          Open link
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="relative group rounded-lg overflow-hidden border bg-muted/20 cursor-zoom-in" onClick={() => setLightbox(true)}>
        <img
          src={url}
          alt="Radiology scan"
          className="w-full max-h-72 object-contain"
          onError={() => setBroken(true)}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent className="max-w-4xl p-2 bg-black/90 border-0">
          <img
            src={url}
            alt="Radiology scan full view"
            className="w-full max-h-[85vh] object-contain rounded"
            onError={() => { setBroken(true); setLightbox(false); }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export const RadiologyReportCard: React.FC<RadiologyReportCardProps> = ({
  reportFindings,
  impression,
  imageUrl,
  notes,
  isCritical,
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        Report
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <p className="text-sm whitespace-pre-wrap">{reportFindings}</p>

      {impression && (
        <div className="border-t pt-2">
          <p className="text-xs text-muted-foreground font-medium mb-1">Impression</p>
          <p className="text-sm">{impression}</p>
        </div>
      )}

      {imageUrl && (
        <div className="border-t pt-3">
          <p className="text-xs text-muted-foreground font-medium mb-2">Scan Image</p>
          <ReportImage url={imageUrl} />
        </div>
      )}

      {notes && <p className="text-sm text-muted-foreground border-t pt-2">{notes}</p>}
      {isCritical && <CriticalBadge isCritical />}
    </CardContent>
  </Card>
);
