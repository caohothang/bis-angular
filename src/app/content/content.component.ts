import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { FetchService } from '../_services/fetch.service';

@Component({
    selector: 'app-content',
    templateUrl: './content.component.html',
    styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit {
    item: any = {};
    languageId: number = 2;
    safeContent: SafeHtml = null;
    pdfUrl: SafeResourceUrl = null;
    rawDocUrl: string = '';
    docFileName: string = '';
    isPdf: boolean = false;
    isOfficeDoc: boolean = false;
    isLoading: boolean = true;

    constructor(
        private _fetchService: FetchService,
        private router: Router,
        private route: ActivatedRoute,
        private sanitizer: DomSanitizer
    ) {}

    ngOnInit() {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.languageId = this._fetchService.languageId || 2;
        const alias = this.route.snapshot.params['alias'] || 'menu';
        this.isLoading = true;
        this._fetchService.getPage(alias).subscribe((res: any) => {
            this.isLoading = false;
            this.item = res || {};
            this.processContent();
        }, err => {
            this.isLoading = false;
            console.error('Error loading page:', err);
        });
    }

    processContent() {
        // Reset document state
        this.pdfUrl = null;
        this.rawDocUrl = '';
        this.docFileName = '';
        this.isPdf = false;
        this.isOfficeDoc = false;
        this.safeContent = null;

        // For Menu page (id == 4 or alias == 'menu'), map English content first as requested
        let rawHtml = '';
        if (this.item.id == 4 || this.item.alias === 'menu') {
            rawHtml = this.item.description_en || this.item.description_vn || '';
        } else {
            rawHtml = (this.languageId === 1)
                ? (this.item.description_vn || this.item.description_en)
                : (this.item.description_en || this.item.description_vn);
        }

        if (!rawHtml) {
            return;
        }

        const trimmed = rawHtml.trim();

        // 1. Detect if content is or contains a document URL
        // Pattern A: Direct URL in text
        const directDocMatch = trimmed.match(/^https?:\/\/[^\s<>"']+\.(pdf|xlsx|xls|docx|doc|pptx|ppt|csv)$/i);
        if (directDocMatch) {
            this.rawDocUrl = directDocMatch[0];
        }

        // Pattern B: Iframe with document src
        if (!this.rawDocUrl) {
            const iframeSrcMatch = rawHtml.match(/<iframe[^>]+src=["']([^"']+)["']/i);
            if (iframeSrcMatch) {
                this.rawDocUrl = iframeSrcMatch[1];
            }
        }

        // Pattern C: <a> link with document href
        if (!this.rawDocUrl) {
            const linkMatch = rawHtml.match(/href=["'](https?:\/\/[^"']+\.(pdf|xlsx|xls|docx|doc|pptx|ppt|csv))["']/i);
            if (linkMatch) {
                this.rawDocUrl = linkMatch[1];
            }
        }

        // 2. Classify document type to avoid browser auto-downloading
        if (this.rawDocUrl) {
            const cleanUrl = this.rawDocUrl.split('?')[0];
            const ext = cleanUrl.split('.').pop()?.toLowerCase();
            this.docFileName = cleanUrl.split('/').pop() || 'document';

            if (ext === 'pdf') {
                // PDF can be safely rendered in browser iframe
                this.isPdf = true;
                this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawDocUrl);
                return;
            } else if (['xlsx', 'xls', 'docx', 'doc', 'pptx', 'ppt', 'csv'].includes(ext)) {
                // Office spreadsheets/docs CANNOT be loaded directly in an iframe
                // because browsers will force auto-downloading them!
                // Instead, show the document preview card so the user can choose to view or download
                this.isOfficeDoc = true;
                this.pdfUrl = null;
                return;
            }
        }

        // 3. Fallback: Standard HTML content
        // Strip any embedded iframes pointing directly to office files to prevent silent auto-downloading in background
        const sanitizedRaw = rawHtml.replace(/<iframe[^>]+src=["'][^"']*\.(xlsx|xls|docx|doc|pptx|ppt)[^"']*["'][^>]*><\/iframe>/gi, '');
        this.safeContent = this.sanitizer.bypassSecurityTrustHtml(sanitizedRaw);
    }
}
