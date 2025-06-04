import { useState } from 'react'

// Joy
import Alert from '@mui/joy/Alert';
import Box from '@mui/joy/Box';
import Checkbox from '@mui/joy/Checkbox';
import CircularProgress from '@mui/joy/CircularProgress';
import Divider from '@mui/joy/Divider';
import Grid from '@mui/joy/Grid';
import LinearProgress from '@mui/joy/LinearProgress';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';

// Icons
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import WarningIcon from '@mui/icons-material/Warning';

function SearchScore(props: {
	pageData: any | undefined,
}) {
	const {
		pageData = undefined,
	} = props;

	const [hasAutosuggest, setHasAutosuggest] = useState<boolean | undefined>(undefined);
	const [hasSpellchecking, setHasSpellchecking] = useState<boolean | undefined>(undefined);

	let searchScore = 0;
	let maxScore = 300;

	if (hasAutosuggest !== undefined) {
		searchScore = searchScore + (hasAutosuggest ? 100 : 0);
		maxScore = maxScore + 100;
	}
	if (hasSpellchecking !== undefined) {
		searchScore = searchScore + (hasSpellchecking ? 100 : 0);
		maxScore = maxScore + 100;
	}

	searchScore = searchScore + (!pageData?.crawl?.data?.pageData?.some((result: any) => result.title === '' || result.description === '') ? 100 : 0);
	searchScore = searchScore + ((pageData?.crawl?.data?.facetData || []).length > 0 ? 100 : 0);
	searchScore = searchScore + (pageData?.crawl?.data?.pageData?.some((result: any) => result.image !== '' ) ? 100 : 0);
	maxScore = maxScore + 300

	pageData?.search?.data?.searchQuality.map((keywordData: any) => {
		if (keywordData?.quality !== undefined) {
			searchScore = searchScore + keywordData?.quality?.relevancy_score * 10;
			maxScore = maxScore + 100;
		}
	});
	searchScore = ((searchScore
							+ ((pageData?.lighthouse?.data?.performance | 0) * 100)
							+ ((pageData?.lighthouse?.data?.seo | 0) * 100)
							+ ((pageData?.lighthouse?.data?.accessibility | 0) * 100)
							+ (pageData?.search?.data?.sitesearch?.height !== 0 ? 100 : 0)
						) / maxScore) * 100;

  return (
    <Box
      sx={{
        margin: 'auto',
        maxWidth: '1178px',
      }}
    >
			<Stack
				divider={<Divider />}
				spacing={3}
			>
				<Stack>
					<Typography level="h3">
						Finding Your Site Search
					</Typography>
					<Grid container rowSpacing={2} alignItems="center">
						<Grid xs={8}>
							<Typography>
								Google SEO Score
							</Typography>
						</Grid>
						<Grid xs={3}>
							<LinearProgress
								determinate
								value={pageData?.lighthouse?.data?.seo * 100}
								color={
									pageData?.lighthouse?.data?.seo > 0.9
									? 'success'
									: pageData?.lighthouse?.data?.seo > 0.7
									? 'warning' : 'danger'
								}
							/>
						</Grid>
						<Grid xs={1}>
							<Typography sx={{textAlign: 'right'}}>
								{((pageData?.lighthouse?.data?.seo || 0) * 100).toFixed(0)}
							</Typography>
						</Grid>
						<Grid xs={8}>
							<Typography>
								Page Load Speed
							</Typography>
						</Grid>
						<Grid xs={3}>
							<LinearProgress
								determinate
								value={pageData?.lighthouse?.data?.performance * 100}
								color={
									pageData?.lighthouse?.data?.performance > 0.9
									? 'success'
									: pageData?.lighthouse?.data?.performance > 0.7
									? 'warning' : 'danger'
								}
							/>
						</Grid>
						<Grid xs={1}>
							<Typography sx={{textAlign: 'right'}}>
								{((pageData?.lighthouse?.data?.performance || 0) * 100).toFixed(0)}
							</Typography>
						</Grid>
						<Grid xs={8}>
							<Typography>
								Site Search Bar
							</Typography>
						</Grid>
						<Grid xs={4}>
							{pageData?.searchpage?.sitesearch?.height !== 0 ? (
								<Alert endDecorator={<CheckCircleRoundedIcon />} color="success">
									Search Bar Found
								</Alert>
							) : (
								<Alert endDecorator={<WarningIcon />} color="warning">
									Could not find search bar
								</Alert>
							)}
						</Grid>
						<Grid xs={8}>
							<Typography>
								Site Search Schema
							</Typography>
						</Grid>
						<Grid xs={4}>
							{pageData?.searchpage?.schema && Object.keys(pageData?.searchpage?.schema)?.length !== 0 ? (
								<Alert endDecorator={<CheckCircleRoundedIcon />} color="success">
									Found Schema
								</Alert>
							) : (
								<Alert endDecorator={<WarningIcon />} color="warning">
									No Search Schema Found
								</Alert>
							)}
						</Grid>
					</Grid>
				</Stack>
				<Stack>
					<Typography level="h3">
						Search Result Page
					</Typography>
					<Grid container alignItems="center" rowSpacing={2}>
						<Grid xs={8}>
							<Typography>
								WCAG Accessibility
							</Typography>
						</Grid>
						<Grid xs={3}>
							<LinearProgress
								determinate
								value={pageData?.lighthouse?.data?.accessibility * 100}
								color={
									pageData?.lighthouse?.data?.accessibility > 0.9
									? 'success'
									: pageData?.lighthouse?.data?.accessibility > 0.7
									? 'warning' : 'danger'
								}
							/>
						</Grid>
						<Grid xs={1}>
							<Typography sx={{textAlign: 'right'}}>
								{((pageData?.lighthouse?.data?.accessibility || 0) * 100).toFixed(0)}
							</Typography>
						</Grid>
						<Grid xs={8}>
							<Typography>
								Auto Suggest
							</Typography>
						</Grid>
						<Grid xs={4}>
							{pageData?.search?.data?.searchFeatures
								? pageData?.search?.data?.searchFeatures?.autocomplete ? (
									<Alert endDecorator={<CheckCircleRoundedIcon />} color="success">
										Autosuggest found!
									</Alert>
								) : (
									<Alert endDecorator={<HelpRoundedIcon />}>
										Not detected
									</Alert>
								)
							: (
								<Alert endDecorator={
									<Checkbox
										checked={hasAutosuggest}
										onClick={() => setHasAutosuggest(!hasAutosuggest)}
										indeterminate={hasAutosuggest === undefined}
									/>
								}>
									Not Tested
								</Alert>
							)}
						</Grid>
						<Grid xs={8}>
							<Typography>
								Spell Checking
							</Typography>
						</Grid>
						<Grid xs={4}>
							{pageData?.search?.data?.searchFeatures
								? pageData?.search?.data?.searchFeatures?.spellchecking ? (
									<Alert endDecorator={<CheckCircleRoundedIcon />} color="success">
										Spell checking found!
									</Alert>
								) : (
									<Alert endDecorator={<HelpRoundedIcon />}>
										Not detected
									</Alert>
								)
							: (
								<Alert endDecorator={
									<Checkbox
										checked={hasSpellchecking}
										onClick={() => setHasSpellchecking(!hasSpellchecking)}
										indeterminate={hasSpellchecking === undefined}
									/>
								}>
									Not Tested
								</Alert>
							)}
						</Grid>
						<Grid xs={8}>
							<Typography>
								Analytics
							</Typography>
						</Grid>
						<Grid xs={4}>
							{pageData?.search?.data?.searchFeatures
								? pageData?.search?.data?.searchFeatures?.analytics ? (
									<Alert endDecorator={<CheckCircleRoundedIcon />} color="success">
										Analytics found!
									</Alert>
								) : (
									<Alert endDecorator={<HelpRoundedIcon />}>
										Not detected
									</Alert>
								)
							: (
								<Alert>
									Not Tested
								</Alert>
							)}
						</Grid>
					</Grid>
				</Stack>
				<Stack>
					<Typography level="h3">
						Search Relevancy
					</Typography>
					<Grid container rowSpacing={1}>
						{pageData?.search?.data?.searchQuality.map((keywordData: any, index: number) => (
							keywordData?.quality !== undefined ? (
								<Grid container xs={12} key={index} alignItems="center">
									<Grid xs={8}>
										<Typography>
											Relevancy for "{keywordData.query}"
										</Typography>
									</Grid>
									<Grid xs={3}>
										<LinearProgress
											determinate
											value={keywordData?.quality?.relevancy_score * 10}
											color={
												keywordData?.quality?.relevancy_score > 9
												? 'success'
												: keywordData?.quality?.relevancy_score > 7
												? 'warning' : 'danger'
											}
										/>
									</Grid>
									<Grid xs={1}>
										<Typography sx={{textAlign: 'right'}}>
											{keywordData?.quality?.relevancy_score > 8
												? keywordData?.quality?.relevancy_score > 7
												? 'High' : 'Medium': 'Low'
											}
										</Typography>
									</Grid>
								</Grid>
							) : (
								<Grid container xs={12} key={index} alignItems="center">
									<Grid xs={8}>
										<Typography>
											Relevancy for "{keywordData.query}"
										</Typography>
									</Grid>
									<Grid xs={4}>
										<Alert endDecorator={<HelpRoundedIcon />}>
											Keyword Relevancy Not Tested
										</Alert>
									</Grid>
								</Grid>
							)
						))}
					</Grid>
				</Stack>
				<Stack>
					<Typography level="h3">
						Site Crawl
					</Typography>
					<Grid container alignItems="center" rowSpacing={2}>
						<Grid xs={8}>
							<Typography>
								Titles and Descriptions
							</Typography>
						</Grid>
						<Grid xs={4}>
							{pageData?.crawl?.data?.pageData
								? !pageData?.crawl?.data?.pageData?.some((result: any) => result.title === '' || result.description === '') ? (
									<Alert endDecorator={<CheckCircleRoundedIcon />} color="success">
										Descriptive titles and meta descriptions
									</Alert>
								) : (
									<Alert endDecorator={<WarningIcon />} color="warning">
										Some missing titles and descriptions
									</Alert>
								)
							: (
								<Alert>
									Not Tested
								</Alert>
							)}
						</Grid>
						<Grid xs={8}>
							<Typography>
								Meta Tags
							</Typography>
						</Grid>
						<Grid xs={4}>
							{pageData?.crawl?.data?.pageData
								? (pageData?.crawl?.data?.facetData || []).length > 0 ? (
									<Alert endDecorator={<CheckCircleRoundedIcon />} color="success">
										Contextual meta tags discovered
									</Alert>
								) : (
									<Alert endDecorator={<HelpRoundedIcon />}>
										Not detected
									</Alert>
								)
							: (
								<Alert>
									Not Tested
								</Alert>
							)}
						</Grid>
						<Grid xs={8}>
							<Typography>
								Images
							</Typography>
						</Grid>
						<Grid xs={4}>
							{pageData?.crawl?.data?.pageData
								? pageData?.crawl?.data?.pageData?.some((result: any) => result.image !== '' ) ? (
									<Alert endDecorator={<CheckCircleRoundedIcon />} color="success">
										Thumbnail images
									</Alert>
								) : (
									<Alert endDecorator={<HelpRoundedIcon />}>
										Not detected
									</Alert>
								)
							: (
								<Alert>
									Not Tested
								</Alert>
							)}
						</Grid>
					</Grid>
				</Stack>
				<Stack direction="row">
					<Grid container xs={12} alignItems="center">
						<Grid xs={8}>
							<Typography level="h3">
								Search Experience Score
							</Typography>
						</Grid>
						<Grid xs={4} sx={{textAlign: 'right'}}>
							<CircularProgress
								determinate
								size="lg"
								value={searchScore}
								color={
									searchScore > 90
									? 'success'
									: searchScore > 70
									? 'warning' : 'danger'
								}
							>
							  {(searchScore).toFixed(0)}
							</CircularProgress>
						</Grid>
					</Grid>
				</Stack>
			</Stack>
		</Box>
  )
}

export default SearchScore
