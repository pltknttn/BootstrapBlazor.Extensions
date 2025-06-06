﻿// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the Apache 2.0 License
// See the LICENSE file in the project root for more information.
// Maintainer: Argo Zhang(argo@live.ca) Website: https://www.blazor.zone

using Microsoft.Extensions.Logging;
using Microsoft.JSInterop;

namespace BootstrapBlazor.Components;

/// <summary>
/// 默认 Html to Image 实现
/// <param name="runtime"></param>
/// <param name="logger"></param>
/// </summary>
class DefaultHtml2ImageService(IJSRuntime runtime, ILogger<DefaultHtml2ImageService> logger) : IHtml2Image
{
    private JSModule? _jsModule;

    /// <summary>
    /// <inheritdoc/>
    /// </summary>
    public Task<string?> GetDataAsync(string selector, IHtml2ImageOptions? options) => Execute(selector, options);

    /// <summary>
    /// <inheritdoc/>
    /// </summary>
    public Task<Stream?> GetStreamAsync(string selector, IHtml2ImageOptions? options) => ToBlob(selector, options);

    private async Task<string?> Execute(string selector, IHtml2ImageOptions? options)
    {
        string? data = null;
        try
        {
            _jsModule ??= await LoadModule();
            if (_jsModule != null)
            {
                data = await _jsModule.InvokeAsync<string?>("execute", selector, "getData", options);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "{Execute} throw exception", nameof(Execute));
        }
        return data;
    }

    private async Task<Stream?> ToBlob(string selector, IHtml2ImageOptions? options)
    {
        Stream? data = null;
        try
        {
            _jsModule ??= await LoadModule();
            if (_jsModule != null)
            {
                var streamRef = await _jsModule.InvokeAsync<IJSStreamReference>("execute", selector, "toBlob", options);
                if (streamRef != null)
                {
                    data = await streamRef.OpenReadStreamAsync(streamRef.Length);
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "{ToBlob} throw exception", nameof(ToBlob));
        }
        return data;
    }

    private Task<JSModule> LoadModule() => runtime.LoadModule("./_content/BootstrapBlazor.Html2Image/html2image.js");
}
