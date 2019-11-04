'use strict';


customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">blueprintnotincluded documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link">AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppModule-0cae49298d77e9fade2be3f7bd84d898"' : 'data-target="#xs-components-links-module-AppModule-0cae49298d77e9fade2be3f7bd84d898"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-0cae49298d77e9fade2be3f7bd84d898"' :
                                            'id="xs-components-links-module-AppModule-0cae49298d77e9fade2be3f7bd84d898"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AppComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link">AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/ModuleBlueprintModule.html" data-type="entity-link">ModuleBlueprintModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ModuleBlueprintModule-5fc3d3f168043e0538084ffdc380dc4b"' : 'data-target="#xs-components-links-module-ModuleBlueprintModule-5fc3d3f168043e0538084ffdc380dc4b"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ModuleBlueprintModule-5fc3d3f168043e0538084ffdc380dc4b"' :
                                            'id="xs-components-links-module-ModuleBlueprintModule-5fc3d3f168043e0538084ffdc380dc4b"' }>
                                            <li class="link">
                                                <a href="components/ComponentBlueprintParentComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ComponentBlueprintParentComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ComponentCanvasComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ComponentCanvasComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ComponentElementKeyPanelComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ComponentElementKeyPanelComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ComponentLoginDialogComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ComponentLoginDialogComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ComponentMenuComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ComponentMenuComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ComponentSaveDialogComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ComponentSaveDialogComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ComponentSideBuildToolComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ComponentSideBuildToolComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ComponentSideSelectionToolComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ComponentSideSelectionToolComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ComponentSidepanelComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ComponentSidepanelComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ComponentTileInfoComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ComponentTileInfoComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogShareUrlComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogShareUrlComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoginFormComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">LoginFormComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RegisterFormComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">RegisterFormComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-ModuleBlueprintModule-5fc3d3f168043e0538084ffdc380dc4b"' : 'data-target="#xs-directives-links-module-ModuleBlueprintModule-5fc3d3f168043e0538084ffdc380dc4b"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-ModuleBlueprintModule-5fc3d3f168043e0538084ffdc380dc4b"' :
                                        'id="xs-directives-links-module-ModuleBlueprintModule-5fc3d3f168043e0538084ffdc380dc4b"' }>
                                        <li class="link">
                                            <a href="directives/DragAndDropDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">DragAndDropDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/KeyboardDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">KeyboardDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/MouseWheelDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">MouseWheelDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/StringSanitationDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">StringSanitationDirective</a>
                                        </li>
                                    </ul>
                                </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-ModuleBlueprintModule-5fc3d3f168043e0538084ffdc380dc4b"' : 'data-target="#xs-injectables-links-module-ModuleBlueprintModule-5fc3d3f168043e0538084ffdc380dc4b"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ModuleBlueprintModule-5fc3d3f168043e0538084ffdc380dc4b"' :
                                        'id="xs-injectables-links-module-ModuleBlueprintModule-5fc3d3f168043e0538084ffdc380dc4b"' }>
                                        <li class="link">
                                            <a href="injectables/AuthenticationService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>AuthenticationService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/BlueprintService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>BlueprintService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/CheckDuplicateService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>CheckDuplicateService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/BBuilding.html" data-type="entity-link">BBuilding</a>
                            </li>
                            <li class="link">
                                <a href="classes/BlueprintParams.html" data-type="entity-link">BlueprintParams</a>
                            </li>
                            <li class="link">
                                <a href="classes/BniBlueprint.html" data-type="entity-link">BniBlueprint</a>
                            </li>
                            <li class="link">
                                <a href="classes/BniBuilding.html" data-type="entity-link">BniBuilding</a>
                            </li>
                            <li class="link">
                                <a href="classes/BSpriteInfo.html" data-type="entity-link">BSpriteInfo</a>
                            </li>
                            <li class="link">
                                <a href="classes/BSpriteModifier.html" data-type="entity-link">BSpriteModifier</a>
                            </li>
                            <li class="link">
                                <a href="classes/BuildMenuCategory.html" data-type="entity-link">BuildMenuCategory</a>
                            </li>
                            <li class="link">
                                <a href="classes/BuildMenuItem.html" data-type="entity-link">BuildMenuItem</a>
                            </li>
                            <li class="link">
                                <a href="classes/Camera.html" data-type="entity-link">Camera</a>
                            </li>
                            <li class="link">
                                <a href="classes/ComposingElement.html" data-type="entity-link">ComposingElement</a>
                            </li>
                            <li class="link">
                                <a href="classes/ConnectionHelper.html" data-type="entity-link">ConnectionHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/ConnectionSprite.html" data-type="entity-link">ConnectionSprite</a>
                            </li>
                            <li class="link">
                                <a href="classes/DrawHelpers.html" data-type="entity-link">DrawHelpers</a>
                            </li>
                            <li class="link">
                                <a href="classes/DrawPart.html" data-type="entity-link">DrawPart</a>
                            </li>
                            <li class="link">
                                <a href="classes/DrawPixi.html" data-type="entity-link">DrawPixi</a>
                            </li>
                            <li class="link">
                                <a href="classes/ImageSource.html" data-type="entity-link">ImageSource</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginInfo.html" data-type="entity-link">LoginInfo</a>
                            </li>
                            <li class="link">
                                <a href="classes/MenuCommand.html" data-type="entity-link">MenuCommand</a>
                            </li>
                            <li class="link">
                                <a href="classes/OniItem.html" data-type="entity-link">OniItem</a>
                            </li>
                            <li class="link">
                                <a href="classes/SaveBlueprintMessage.html" data-type="entity-link">SaveBlueprintMessage</a>
                            </li>
                            <li class="link">
                                <a href="classes/SaveInfo.html" data-type="entity-link">SaveInfo</a>
                            </li>
                            <li class="link">
                                <a href="classes/SpriteInfo.html" data-type="entity-link">SpriteInfo</a>
                            </li>
                            <li class="link">
                                <a href="classes/SpriteModifier.html" data-type="entity-link">SpriteModifier</a>
                            </li>
                            <li class="link">
                                <a href="classes/TechnicalRepack.html" data-type="entity-link">TechnicalRepack</a>
                            </li>
                            <li class="link">
                                <a href="classes/Template.html" data-type="entity-link">Template</a>
                            </li>
                            <li class="link">
                                <a href="classes/TemplateItem.html" data-type="entity-link">TemplateItem</a>
                            </li>
                            <li class="link">
                                <a href="classes/TemplateItemElement.html" data-type="entity-link">TemplateItemElement</a>
                            </li>
                            <li class="link">
                                <a href="classes/TemplateItemTile.html" data-type="entity-link">TemplateItemTile</a>
                            </li>
                            <li class="link">
                                <a href="classes/TemplateItemWire.html" data-type="entity-link">TemplateItemWire</a>
                            </li>
                            <li class="link">
                                <a href="classes/TileInfo.html" data-type="entity-link">TileInfo</a>
                            </li>
                            <li class="link">
                                <a href="classes/ToolRequest.html" data-type="entity-link">ToolRequest</a>
                            </li>
                            <li class="link">
                                <a href="classes/Vector2.html" data-type="entity-link">Vector2</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AuthenticationService.html" data-type="entity-link">AuthenticationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BlueprintService.html" data-type="entity-link">BlueprintService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CheckDuplicateService.html" data-type="entity-link">CheckDuplicateService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/DrawAbstraction.html" data-type="entity-link">DrawAbstraction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Element.html" data-type="entity-link">Element</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OniBuilding.html" data-type="entity-link">OniBuilding</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OniCell.html" data-type="entity-link">OniCell</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OniTemplate.html" data-type="entity-link">OniTemplate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TemplateItemCloneable.html" data-type="entity-link">TemplateItemCloneable</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TokenPayload.html" data-type="entity-link">TokenPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TokenResponse.html" data-type="entity-link">TokenResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Tool.html" data-type="entity-link">Tool</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserDetails.html" data-type="entity-link">UserDetails</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UtilityConnection.html" data-type="entity-link">UtilityConnection</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});